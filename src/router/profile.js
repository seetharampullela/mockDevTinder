const express = require("express");
const User = require("../model/user");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const jwt = require("jsonwebtoken");

profileRouter.get("/profile", userAuth, async (req, res) => {
  try {
    const { token } = req.cookies;
    /* 
      1. decodedToken would look like { _id: '69b9836ef977dfdca2c30c0c', iat: 1773799587 }
      2. _id is the secret key that we stored while login, and iat is added as default by jwt
    */
    const decodedTokenValue = await jwt.verify(token, "DEV@TINDER142");
    const { _id } = decodedTokenValue;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("Invalid User");
    }
    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
