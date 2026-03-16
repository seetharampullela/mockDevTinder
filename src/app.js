const express = require("express");
const { adminAuth } = require("./middlewares/auth");
const app = express();

app.use("/admin", adminAuth);

app.use("/admin/getUser", (req, res) => {
  res.send("Get Admin user >>> Route");
});

app.use("/getUserData", (req, res) => {
  throw new Error("No user Data");
});

app.use("/", (err, req, res, next) => {
  if (err) {
    res.status(500).send("Something went wrong");
  }
});

// app.use("/user", (req, res) => {
//   res.send("First Route");
// });

// app.get("/getApp", (req, res) => {
//   res.send("Get Route");
// });

// app.post("/postApp", (req, res) => {
//   res.send("Post Route");
// });

app.listen(7777, () => {
  console.log("Server started.");
});
