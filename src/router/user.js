const express = require("express");
const User = require("../model/user");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const user = await User.find();
    res.send(user);
  } catch (err) {
    res.status(400).send("Cannot find any data");
  }
});

userRouter.post("/getUserByEmail", userAuth, async (req, res) => {
  const emailId = req.body.emailId;
  try {
    const user = await User.find({ emailId });
    res.send(user);
  } catch (err) {
    res.status(400).send("User Not Found");
  }
});

userRouter.delete("/user", userAuth, async (req, res) => {
  const userId = req.body.userId;
  try {
    if (userId) {
      const user = await User.findByIdAndDelete(userId);
      if (user) {
        res.send("User Deleted Successfully.");
      } else {
        res.status(500).send(`User with ${userId} not found`);
      }
    } else {
      res.status(500).send(`Please send the valid userId`);
    }
  } catch (err) {
    res.status(404).send("User Not Found");
  }
});

userRouter.post("/addUsers", userAuth, async (req, res) => {
  try {
    await User.insertMany(req.body);
    res.send("Users added successfully");
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

/* Patch call is generally made to update a few fields of the Document */
userRouter.patch("/user/:userId", userAuth, async (req, res) => {
  const userId = req.params.userId;
  const updatePayload = req.body;

  try {
    /* we can use findOneAndUpdate method too here */
    // Third argument is the options > Read documentation https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()
    const user = await User.findByIdAndUpdate(userId, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    });
    const ALLOWED_UPDATES = ["firstName", "lastName", "skills", "emailId"];
    if (!Object.keys(req.body).every((i) => ALLOWED_UPDATES.includes(i))) {
      throw new Error("Update is not allowed for this payload");
    }

    if (req.body?.skills?.length > 10) {
      throw new Error("Skills shall not be greater than 10");
    }

    if (user) {
      res.send({ successMessage: "User Updated Successfully", [userId]: user });
    } else {
      res.status(500).send(`The user with ${userId} does not exist`);
    }
  } catch (err) {
    res.status(400).send("UPDATE FAILED: " + err.message);
  }
});

module.exports = userRouter;
