const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2fsgp3y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db("swiftParcelDB").collection("users");
    const parcelCollection = client.db("swiftParcelDB").collection("parcels");

    //user related Api
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      if (user.email === null) {
        return res.send({ message: "email invalid", email: null });
      }
      const isExistUser = await userCollection.findOne(query);
      if (isExistUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = userCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users/admin/:id', async(req,res)=>{
      const id=req.params.id;
      const filter= {_id: new ObjectId(id)}
      const updatedDoc={
        $set:{
          role:'Admin'
        }
      }
      const result= await userCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })
    app.patch('/users/user/:id', async(req,res)=>{
      const id=req.params.id;
      const filter= {_id: new ObjectId(id)}
      const updatedDoc={
        $set:{
          role:'User'
        }
      }
      const result= await userCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })
    app.patch('/users/deliveryMan/:id', async(req,res)=>{
      const id=req.params.id;
      const filter= {_id: new ObjectId(id)}
      const updatedDoc={
        $set:{
          role:'Delivery Man'
        }
      }
      const result= await userCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })


    // parcel related api
    app.get('/parcels', async(req,res)=>{
      const result= await parcelCollection.find().toArray()
      res.send(result)
    })
    app.post("/parcels", async (req, res) => {
      const parcel = req.body;
      const result = await parcelCollection.insertOne(parcel);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
