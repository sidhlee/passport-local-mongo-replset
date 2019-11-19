"use strict";

//TODO: redo with babel and ES6
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

const auth = require("./auth");
const routes = require("./routes");

const app = express();

// TODO: check if it works without virtual path prefix
app.use("/public", express.static(process.cwd() + "/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "pug");

MongoClient.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(client => {
    console.log("connected to database");
    const db = client.db(process.env.DB_NAME);
    auth(app, db);
    routes(app, db);

    app.listen(process.env.PORT || 2000, () => {
      console.log("Listening on PORT: " + process.env.PORT);
    });
  })
  .catch(err => {
    console.log(`Error while connecting to db: ${err}`);
  });
