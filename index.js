const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const ObjectID  = require('mongodb').ObjectID;
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()



// const uri =
//   "mongodb+srv://eBachelor:3ApXHf3IoUtd5zGI@cluster0.rzm4j.mongodb.net/bachelorCommerce?retryWrites=true&w=majority";

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());



app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rzm4j.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const orderCollection = client.db("photoDiary").collection("orders");
    const adminCollection = client.db("photoDiary").collection("admin");
    const reviewCollection = client.db("photoDiary").collection("reviews");
    const newOrderCollection = client.db("photoDiary").collection("newOrder");
    const packageCollection = client.db("photoDiary").collection("packages");
// const packageCollection = client.db("eBachelor").collection("products");
// const ordersCollection = client.db("eBachelor").collection("orders");
// const cartCollection = client.db("eBachelor").collection("cart");


    app.patch('/update/:id', (req, res)=>{
        console.log(req.params.id);
        console.log(req.body);
        orderCollection.updateOne({_id: ObjectID(req.params.id)},
        {
            $set: {status:req.body.status}
        })
        .then(result => {
            // console.log(result);
        })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/addAdmin', (req, res) => {
        const email = req.body;
        adminCollection.insertOne(email)
            .then(result => {
                res.send(result.insertedCount > 0)
            });
    });

    app.get('/orders', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.post('/ordersByUser', (req, res) => {
        const email = req.body.email;
        console.log(email);
        orderCollection.find({email: email})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, doctors) => {
                // console.log(doctors);
                res.send(doctors.length > 0);
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
                        res.send(documents);
                    })
            })
    })
    app.post('/addReview', (req, res) => {
        const name = req.body.name;
        const description = req.body.description;
        const location = req.body.location;
        reviewCollection.insertOne( {name, location, description})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.post('/addAPackage', (req, res) => {
        console.log(req);
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        const price = req.body.price;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };

        packageCollection.insertOne( {name, price, description, image})
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })

    app.get('/packages', (req, res) => {
        packageCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
                console.log(documents);
            })
    });

    app.get('/reviews', (req, res) => {
        reviewCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/addToOrder', (req, res) => {
        const order = req.body;
        orderCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.delete('/deleteOldOrder', (req, res) => {
        const id = ObjectID(req.params.id);
        newOrderCollection.deleteMany()
            .then(documents => {
            console.log(document);
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
        console.log(order);
        newOrderCollection.insertOne(order)
            .then(result => {
            console.log(result);
            res.send(result.insertedCount > 0)

        })

    })

      app.delete('/delete/:id', (req, res) => {

          const id = ObjectID(req.params.id);
          packageCollection.findOneAndDelete({_id: id})
          .then(documents => {
              res.send(!!documents.value);
            })
      })
});
app.listen(process.env.PORT || port)