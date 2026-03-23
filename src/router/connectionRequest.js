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
      const loggedInUser = req.user;
      const fromUserId = loggedInUser._id;
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
        $or: [{ fromUserId: toUserId, toUserId: fromUserId }],
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
        message: `Connection Request from ${loggedInUser.firstName} ${status}`,
        data: connectionRequest,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  },
);

connectionRequestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const loggedInUser = req.user;
      const allowedStatuses = ["accepted", "rejected"];
      if (!allowedStatuses.includes(status)) {
        return res
          .status(400)
          .json({ message: "The requested status is not allowed" });
      }
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      console.log("connectionRequest>>", loggedInUser);
      if (!connectionRequest) {
        return res.status(400).json({ message: "No request found " });
      }

      connectionRequest.status = status;
      const updatedConnectionRequest = await connectionRequest.save();
      res.json({
        message: `The user ${status} the request`,
        data: updatedConnectionRequest,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  },
);

module.exports = connectionRequestRouter;
