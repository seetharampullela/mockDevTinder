const express = require("express");
const app = express();

app.use("/admin", (req, res, next) => {
  const token = "xyz"; //TODO: Temp token
  const isAuthorized = token == "yz";
  if (isAuthorized) {
    next();
    // res.send("all data");
  } else {
    res.status(401).send("Unauthorized request");
  }
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
