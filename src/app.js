const express = require("express");
const { adminAuth } = require("./middlewares/auth");
const app = express();

app.use("/admin", (req, res, next) => {
  adminAuth(req, res, next);
});

app.use("/admin/getUser", (req, res) => {
  res.send("Admin getUser Route");
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
