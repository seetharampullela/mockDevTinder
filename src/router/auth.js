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
    const savedUser = await user.save();
    const token = await savedUser.getJWT();
    res.cookie("token", token, {
      expires: new Date(Date.now() + 60 * 60 * 1000),
    });

    res.json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, loginId } = req.body;
    const { password } = req.headers;
    // const {loginId} = req.params;
    const user = await User.findOne({ $or: [{ loginId }, { emailId }] });
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
        res.json(user);
      } else {
        throw new Error("Invalid credentials");
      }
    }
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
    });
    const { token } = req.cookies;
    res.send("Logged out" + token);
  } catch (err) {
    res.status(400).send("ERROR: " + err);
  }
});

module.exports = authRouter;
