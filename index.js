const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
// const userEmail = require('mongodb').userEmail;

const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// firebase admin initialization

const { initializeApp } = require("firebase-admin/app");

initializeApp();
var admin = require("firebase-admin");

// var serviceAccount = require("./ace-of-science-firebase-adminsdk-nn20j-432cb86bc9.json");

// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

app.use(cors());
app.use(express.json());



// connecting database ---------------------->
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rrls8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
});
// connecting database--------------------------->

// verify token----------------------->

async function verifyToken(req, res, next) {
    res.header({"Access-Control-Allow-Origin": "https://warm-citadel-00877.herokuapp.com/"})
    if (req.headers?.authorization?.startsWith("Bearer ")) {
        const idToken = req.headers.authorization.split("Bearer ")[1];
        try {
            const decodedUser = await admin.auth().verifyIdToken(idToken);
            // console.log('email',decodedUser.email);
            req.decodedEmail = decodedUser.email;
            
        } catch {}
    }
    next();
}
// verify token------------------------->

async function run() {
    try {
        await client.connect();
        const database = client.db("Ace-of-Science-own");
        const reviewCollection = database.collection("Review");
        const blogCollection = database.collection("Blogs");
        const profileCollection = database.collection("Profile");
        // create a document to insert

        // Review Data post --------------------------->
        app.post("/review", async (req, res) => {
            const review = req.body;

            const reviewResult = await reviewCollection.insertOne(review);
            res.send(reviewResult);
        });
        // review data post ----------------------------->

        // Review Data get --------------------------->
        app.get("/review", async (req, res) => {
            const cursor = reviewCollection.find({});
            const getReview = await cursor.toArray();
            res.send(getReview);
        });
        // review data get ----------------------------->
        // review data delete------------------------------>

        app.delete("/review/:id", async (req, res) => {
            // console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            // console.log(result);
            res.json(result);
        });

        // review data delete------------------------------>

        // blog data post------------------------------->
        app.post("/blogs", async (req, res) => {
            const blogs = req.body;
            // console.log(blogs);
            const blogResult = await blogCollection.insertOne(blogs);
            // console.log(blogResult);
            res.send(blogResult);
        });
        // blog data post--------------------------------->

        // single blog data get--------------------->
        app.get("/single-blog/:id", async (req, res) => {
            // console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            // console.log(query);
            const cursor = await blogCollection.findOne(query);
            // console.log(cursor);
            res.send(cursor);
        });
        // single blog data get-------------------------------->

        // blog data get---------------------------------->
        app.get("/blogs", async (req, res) => {
            const cursor = blogCollection.find({});
            const getBlog = await cursor.toArray();
            res.send(getBlog);
        });
        // blog data get-------------------------------->

        // blog data delete------------------------------>

        app.delete("/blogs/:id", async (req, res) => {
            // console.log(req.params.id);
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await blogCollection.deleteOne(query);
            // console.log(result);
            res.json(result);
        });

        // blog data delete------------------------------>

        // profile update post---------------------------->

        app.put("/profile", async (req, res) => {
            const profile = req.body;
            const userEmail = req.query.email;
            console.log(profile, userEmail);
            const query = { userEmail: userEmail };
            const options = { upsert: true };
            const updateUser = {
                $set: {
                    address: profile.address,
                    school: profile.school,
                    phone: profile.phone,
                    profession: profile.profession,
                },
            };
            const profileResult = await profileCollection.updateOne(query, updateUser, options);
            console.log(profileResult);
            res.json(profileResult)
        });

        // profile update post---------------------------->

        // profile data get---------------------------------->
        app.get("/profile", verifyToken, async (req, res) => {
            // console.log(req.query);

            const userEmail = req.query.email;

            if (req.decodedEmail === userEmail) {
                const query = { userEmail: userEmail };
                const cursor = await profileCollection.findOne(query);
                res.send(cursor);
          }
            else {
              res.status(401).send('You Have No Permission to access this data. Cause you are not authorized')
          }
            // console.log(cursor);
        });
        // profile data get-------------------------------->
    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.listen(port, () => {
    console.log("server is running on port", port);
});
