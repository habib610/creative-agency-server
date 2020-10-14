const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();


const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());


app.get("/", (req, res)=>{
    res.send("Creative Agency Server");
})



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zcwe.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");

///taking order from clients
app.post("/takeOrder", (req, res)=>{
    const order = req.body;
    // console.log(order)
    orderCollection.insertOne(order)
    .then(result=>{
        res.send(result.insertedCount > 0)
    })
})

//taking Reviews form client
app.post("/takeReview", (req, res)=>{
    const review = req.body;
    console.log(review)
    reviewCollection.insertOne(review)
    .then(result=>{
        res.send(result.insertedCount > 0)
    })
})


//getting filtered own services to customer dashboard
app.get('/takenServices', (req, res)=>{
    orderCollection.find({email: req.query.email})
    .toArray((err, documents)=>{
    res.send(documents);
    })
})

//getting all user who are using our services
app.get('/allUsers', (req, res)=>{
    orderCollection.find({})
    .toArray((err, documents)=>{
    res.send(documents);
    })
})

//getting all reviews to home page
app.get('/getReviews', (req, res)=>{
    reviewCollection.find({})
    .toArray((err, documents)=>{
    res.send(documents);

    })
})


//   client.close();
});





app.listen( process.env.PORT || port, ()=> console.log("Awesome!"))