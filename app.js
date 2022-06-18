require("dotenv").config();

// DB connection
require("./config/database").connect();

const express = require("express");
const User = require("./model/user");
const app = express();

// setting up a middleware for express to handle json
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Welcome from basic authentication!</h1>");
});

app.post("/register", async (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!(email && password && firstname && lastname)) {
    res.status(400).send("All fiends are required!");
  }

  // User already exists or not
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(401).send("User already exist!");
  }
});

module.exports = app;
