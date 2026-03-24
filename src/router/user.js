const express = require("express");
const User = require("../model/user");
const userRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const connectionRequest = require("../model/connectionRequest");
// userRouter.get("/feed", userAuth, async (req, res) => {
//   try {
//     const user = await User.find();
//     res.send(user);
//   } catch (err) {
//     res.status(400).send("Cannot find any data");
//   }
// });

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
    const ALLOWED_UPDATES = ["firstName", "lastName", "skills", "emailId"];
    if (!Object.keys(req.body).every((i) => ALLOWED_UPDATES.includes(i))) {
      throw new Error("Update is not allowed for this payload");
    }

    if (req.body?.skills?.length > 10) {
      throw new Error("Skills shall not be greater than 10");
    }
    /* we can use findOneAndUpdate method too here */
    // Third argument is the options > Read documentation https://mongoosejs.com/docs/api/model.html#Model.findByIdAndUpdate()
    const user = await User.findByIdAndUpdate(userId, updatePayload, {
      returnDocument: "after",
      runValidators: true,
    });

    if (user) {
      res.send({ successMessage: "User Updated Successfully", [userId]: user });
    } else {
      res.status(500).send(`The user with ${userId} does not exist`);
    }
  } catch (err) {
    res.status(400).send("UPDATE FAILED: " + err.message);
  }
});
const USER_FIELDS = "_id firstName lastName photoUrl age gender about";
/* 
- GET /user/requests/received
*/
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionsData = await connectionRequest
      .find({
        toUserId: loggedInUser._id,
        status: "interested",
      })
      .populate("fromUserId", USER_FIELDS)
      .populate("toUserId", USER_FIELDS);

    res.json({ data: connectionsData });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionsData = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        status: "accepted",
      })
      .populate("fromUserId toUserId", "firstName lastName photoUrl");
    // .populate("fromUserId", ["firstName", "lastName"])
    // .populate("toUserId", ["firstName", "lastName"]);

    const data = connectionsData.map((connectedUser) => {
      if (connectedUser.fromUserId.equals(loggedInUser._id)) {
        return connectedUser.toUserId;
      }
      return connectedUser.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

/* add more filter criteria */
userRouter.get("/user/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    // const { page, limit } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skill = req.query?.skill || "";
    const skip = (page - 1) * limit;

    const connectionsData = await connectionRequest
      .find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
        // status: { $in: ["accepted", "interested", "ignored", "rejected"] },
      })
      // .populate("fromUserId toUserId", "firstName lastName photoUrl");
      .select("fromUserId toUserId");
    // const connectedUserIds = [];
    // connectionsData.forEach((i) => {
    //   connectedUserIds.push(i.fromUserId);
    //   connectedUserIds.push(i.toUserId);
    // });
    // const data = await User.find({
    //   _id: { $nin: [...connectedUserIds, loggedInUser._id] },
    // });

    const connectedUserIds = new Set();
    connectionsData.forEach((i) => {
      connectedUserIds.add(i.fromUserId.toString());
      connectedUserIds.add(i.toUserId.toString());
    });

    // const data = await User.find({
    //   $and: { _id: { $nin: Array.from(connectedUserIds) } , { _id: { $ne: loggedInUser_.id } }}
    // })

    const queryBuilder = {
      $and: [
        { _id: { $nin: Array.from(connectedUserIds) } },
        { _id: { $ne: loggedInUser._id } },
      ],
    };

    if (skill) {
      const skillArray = skill.split(",");
      queryBuilder.$and.push({ skills: { $in: Array.from(skillArray) } });
    }

    const data = await User.find(queryBuilder)
      .skip(skip)
      .limit(limit)
      .sort({ firstName: "asc" })
      .select(USER_FIELDS);

    res.json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
