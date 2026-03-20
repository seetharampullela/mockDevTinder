const express = require("express");
const connectionRequestRouter = express.Router();
const User = require("../model/user");

const ConnectionRequest = require("../model/connectionRequest");
const { userAuth } = require("../middlewares/auth");

connectionRequestRouter.get("/request", async (req, res) => {
  res.send("This is still in implementation");
});

connectionRequestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const { status, toUserId } = req.params;
      const user = req.user;
      const fromUserId = user._id;
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const toUser = await User.findOne({ _id: toUserId });
      if (!toUser) {
        return res.status(404).json({ message: "User Not Found" });
      }
      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingRequest) {
        return res
          .status(404)
          .json({ message: "Connection Request already exists" });
      }
      //   if (fromUserId == toUserId) {
      //     return res.status(404).json({
      //       message:
      //         "You are sending the connection request to yourself which is odd and awful",
      //     });
      //   }
      const allowedStatus = ["ignored", "interested"];

      if (!allowedStatus.includes(status)) {
        return res.status(404).json({ message: "Invalid status type" });
      }

      await connectionRequest.save();
      res.json({
        message: "Connection Request sent successfully",
        data: connectionRequest,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  },
);

module.exports = connectionRequestRouter;
