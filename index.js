const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectID  = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rzm4j.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;


const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000;

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("photoDiary").collection("orders");
    const adminCollection = client.db("photoDiary").collection("admin");
    const packageCollection = client.db("photoDiary").collection("packages");
    const reviewCollection = client.db("photoDiary").collection("reviews");
    const newOrderCollection = client.db("photoDiary").collection("newOrder");

    // console.log(err);
    app.patch('/update/:id', (req, res)=>{
        console.log(req.params.id);
        orderCollection.updateOne({_id: ObjectID(req.params.id)},
        {
            $set: {status:req.body.status}
        })
        .then(result => {
            console.log(result);
        })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        // console.log(order);
        orderCollection.insertOne(order)
            .then(result => {
                // console.log(result);
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/addAdmin', (req, res) => {
        const email = req.body;
        console.log(req);
        // console.log(appointment);
        adminCollection.insertOne(email)
            .then(result => {
                // console.log(result);
                res.send(result.insertedCount > 0)
            })
    });

    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/ordersByUser', (req, res) => {
        const email = req.body.email;
        console.log(email);
        orderCollection.find({email: email})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body;
        const email = req.body.email;
        orderCollection.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                orderCollection.find(filter)
                    .toArray((err, documents) => {
                        // console.log(email, date.date, doctors, documents)
                        res.send(documents);
                    })
            })
    })
    app.post('/addReview', (req, res) => {
        // const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const location = req.body.location;
        // const newImg = file.data;
        // console.log(name, prdescription)
        // const encImg = newImg.toString('base64');

        // var image = {
        //     contentType: file.mimetype,
        //     size: file.size,
        //     img: Buffer.from(encImg, 'base64')
        // };

        reviewCollection.insertOne( {name, location, description})
            .then(result => {
                // console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addAPackage', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        // console.log(name, price,description)
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        packageCollection.insertOne( {name, price, description, image})
            .then(result => {
                // console.log(result);
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/packages', (req, res) => {
        packageCollection.find({})
            .toArray((err, documents) => {
                // console.log(documents)
                res.send(documents);
            })
    });

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                // console.log(documents)
                res.send(documents);
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                // console.log(doctors);
                res.send(doctors.length > 0);
            })
    })




    app.post('/addToOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
        .then(result => {
            // console.log(result);
            res.send(result.insertedCount > 0)
        })
    })

    app.delete('/deleteOldOrder', (req, res) => {
      
        const id = ObjectID(req.params.id);
        // console.log('delete this', id);
        newOrderCollection.deleteMany()
        .then(documents => {
            res.send(!!documents.value);
          })
    })

    app.get('/newOrder', (req, res) => {
        newOrderCollection.find()
        .toArray((err, items) => {
            res.send(items);
        })
    })

    app.post('/addNewOrder', (req, res) => {
        const order = req.body;
        newOrderCollection.insertOne(order)
        .then(result => {
            // console.log(result);
            res.send(result.insertedCount > 0)
    
        })
    
    })

    // app.get('/products', (req, res) => {
    //     eventCollection.find()
    //     .toArray((err, items) => {
    //         res.send(items);
    //     })
    // })
    
      app.delete('/delete/:id', (req, res) => {
          
          const id = ObjectID(req.params.id);
        //   console.log('delete this', id);
          packageCollection.findOneAndDelete({_id: id})
          .then(documents => {
              res.send(!!documents.value);
            })
      })

});


app.listen(process.env.PORT || port)