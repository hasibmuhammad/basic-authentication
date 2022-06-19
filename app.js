require("dotenv").config();

// DB connection
require("./config/database").connect();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");

const User = require("./model/user");
const auth = require("./middleware/auth");

const app = express();

// setting up a middleware for express to handle json
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("<h1>Welcome from basic authentication!</h1>");
});

app.post("/register", async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    if (!(email && password && firstname && lastname)) {
      res.status(400).send("All fiends are required!");
    }

    // User already exists or not
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(401).send("User already exist!");
    }

    // Since it will take some time to roundup the operation of hashing the password and encrypt!
    const myEncPassword = await bcrypt.hash(password, 10);

    // since it will take some time to create the user, so we can use here either the .then, .catch or await :)
    const user = await User.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: myEncPassword,
    });

    // token
    const token = jwt.sign(
      { user_id: user._id, email },
      process.env.SECRET_KEY,
      {
        expiresIn: "2h",
      }
    );

    // In the user model of property token - just assinging the token we've just generated
    user.token = token;

    // update or not in the DB

    //handle password situation
    user.password = undefined;

    // res.status(201).json(user);

    // If needs to use cookies
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res
      .status(200)
      .cookie("token", token, options)
      .json({ success: true, token, user });
  } catch (error) {
    console.log(error);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!(email && password)) {
      res.status(400).send("Field is missing!");
    }

    const user = await User.findOne({ email });

    // if (!user) {
    //   res.status(400).send("You are not registered in our application!");
    // }

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        {
          expiresIn: "2h",
        }
      );

      user.token = token;
      user.password = undefined;
      res.status(200).json(user);
    }

    res.status(400).send("Email or Password is incorrect!");
  } catch (error) {
    console.log(error);
  }
});

app.get("/dashboard", auth, (req, res) => {
  res.send("<h1>Welcome to the secret dashboard area!</h1>");
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.send("Cookies token cleared!");
});

module.exports = app;
