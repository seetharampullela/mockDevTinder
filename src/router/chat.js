const express = require("express");
const chatRouter = express.Router();
const Chat = require("../model/chat");
const { userAuth } = require("../middlewares/auth");

const USER_DETAILS = "_id firstName lastName";

chatRouter.get("/chat/:toUserId", userAuth, async (req, res) => {
  try {
    const { user } = req;
    const { toUserId } = req.params;
    const chat = await Chat.findOne({
      participants: { $all: [user._id, toUserId] },
    })
      .populate("participants", USER_DETAILS)
      .populate("message.senderId", USER_DETAILS);
    res.status(200).json(chat);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
});

module.exports = chatRouter;
