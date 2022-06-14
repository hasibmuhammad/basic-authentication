require("dotenv").config();
const express = require("express");

const app = express();

// setting up a middleware for express to handle json
app.use(express.json());

app.get("/", (req, res) => {
  res.send("<h1>Welcome from basic authentication!</h1>");
});

app.post("/register", (req, res) => {
  const { firstname, lastname, email, password } = req.body;

  if (!(email && password && firstname && lastname)) {
    res.status(400).send("All fiends are required!");
  }
});

module.exports = app;
