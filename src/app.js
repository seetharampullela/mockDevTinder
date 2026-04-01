const express = require("express");
const app = express();
const { connectDb } = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
require("./utils/cronJob");

const authRouter = require("./router/auth");
const userRouter = require("./router/user");
const profileRouter = require("./router/profile");
const connectionRequestRouter = require("./router/connectionRequest");

// A middleware - To Bypass CORS error
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
// A middleware - To Read the request body that is in JSON format
app.use(express.json());
// A middleware - To parse the cookies else will be undefined
app.use(cookieParser());

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", connectionRequestRouter);

connectDb()
  .then(() => {
    console.log("Database connection established...");
    app.listen(process.env.PORT, () => {
      console.log("Server started listening to the 7777 port");
    });
  })
  .catch((e) => {
    console.log("there is an error", e);
  });
