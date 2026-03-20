const express = require("express");
const User = require("../model/user");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const bcrypt = require("bcrypt");
const { validateEditProfileData } = require("../utils/userValidation");
const validator = require("validator");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    if (!req.user) {
      throw new Error("Invalid Request");
    }
    res.send(req.user);
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    const isEditAllowed = validateEditProfileData(req);
    if (!isEditAllowed) {
      throw new Error("Input is not allowed");
    }
    const loggedInUser = req.user;
    if (!req.user) {
      throw new Error("Invalid Request");
    }
    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.send("Profile Updated Successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

profileRouter.patch("/profile/password", userAuth, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.user;
    const validOldPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validOldPassword) {
      throw new Error("Wrong password");
    }
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Please enter a strong password");
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(user._id, { password: newPasswordHash });
    res.send("Password successfully reset");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

module.exports = profileRouter;
