const express = require("express");
const User = require("../model/user");
const { validateUserData } = require("../utils/userValidation");
const bcrypt = require("bcrypt");
const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    validateUserData(req);
    const { firstName, lastName, password, emailId, loginId } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      loginId: loginId,
    });
    await user.save();
    res.send("User added successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login/:loginId", async (req, res) => {
  try {
    const { password } = req.headers;
    const loginId = req.params?.loginId;
    const user = await User.findOne({ loginId: loginId });
    if (!user) {
      throw new Error("Invalid credentials");
    } else {
      const isValidPassword = await user.validatePassword(password);
      /* 
        jwt.sign method accepts data obj and a private secret key(used for verifying later). 
        Secret key could be anything. 
      */
      const jwtToken = await user.getJWT();

      res.cookie("token", jwtToken, {
        expires: new Date(Date.now() + 60 * 60 * 1000),
      });
      if (isValidPassword) {
        res.json({ message: "Login Successful!!!", sessionUser: user });
      } else {
        throw new Error("Invalid credentials");
      }
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  res.clearCookie();
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });
  res.send("Logged out");
});

module.exports = authRouter;
