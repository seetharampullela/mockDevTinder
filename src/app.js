const express = require("express");
const { userAuth } = require("./middlewares/auth");
const app = express();
const { connectDb } = require("./config/database");
const User = require("./model/user");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

const authRouter = require("./router/auth");
const userRouter = require("./router/user");

// A middleware - To Read the request body that is in JSON format
app.use(express.json());
// A middleware - To parse the cookies else will be undefined
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", userRouter);

connectDb()
  .then(() => {
    console.log("Database connection established...");
    app.listen(7777, () => {
      console.log("Server started listening to the 7777 port");
    });
  })
  .catch((e) => {
    console.log("there is an error", e);
  });
