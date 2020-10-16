const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config();


const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('services'));
app.use(fileUpload());


app.get("/", (req, res)=>{
    res.send("Creative Agency Server");
})



const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zcwe.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
  const orderCollection = client.db(`${process.env.DB_NAME}`).collection("orders");
  const reviewCollection = client.db(`${process.env.DB_NAME}`).collection("reviews");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admins");
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection("service");

///taking order from clients
app.post("/takeOrder", (req, res)=>{
    const order = req.body;
    orderCollection.insertOne(order)
    .then(result=>{
        res.send(result.insertedCount > 0)
    })
})


//taking Reviews form client
app.post("/takeReview", (req, res)=>{
    const review = req.body;
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


// make  admins
app.post('/makeAdmin', (req, res)=>{
    const admin = req.body;
    adminCollection.insertOne(admin)
    .then(result=>{
        res.send(result.insertedCount > 0)
    })
})

// Testing admin or user 
app.get('/getAdmin', (req, res)=>{
    adminCollection.find({email: req.query.email})
    .toArray((err, documents)=>{
    res.send(documents.length > 0);
    })
})

app.get('/getService', (req, res)=>{
    serviceCollection.find({})
    .toArray((err, documents)=>{
        res.send(documents);
    })
})

//update Status
app.patch('/updateStatus/:uniqueKey', (req, res)=>{
    console.log(req.params.uniqueKey)
    orderCollection.updateOne({_id: ObjectId(req.params.uniqueKey)},
  {
    $set:{status: req.body.status}
  })
  .then(result=>{
    console.log(result)
  })
})


//fileUpload files
app.post('/addServices', (req, res)=>{
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    console.log(title, description, file);
    const filePath = `${__dirname}/services/${file.name}`;
    file.mv(filePath, err=>{
        if(err){
            console.log(err);
            return res.status(500).send({msg: "failed to upload images"})
        }
        const newImg = fs.readFileSync(filePath);
        const encImg = newImg.toString('base64');

        var image ={
            contentType: req.files.file.mimetype,
            size: req.files.file.size,
            img: Buffer(encImg, 'base64')
        }

        serviceCollection.insertOne({title, description, image})
        .then(result=>{
            fs.remove(filePath, err=>{
                if(err){console.log(err)}
                res.send(result.insertedCount>0)
            })
        })
        // return res.send({name: file.name, path: `/${file.name}`})
    })
})



//   client.close();
});





app.listen( process.env.PORT || port, ()=> console.log("Awesome!"))