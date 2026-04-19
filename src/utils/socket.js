const socket = require("socket.io");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const Chat = require("../model/chat");

const getSecureRoomId = (fromUserId, toUserId) => {
  return crypto
    .createHash("sha256")
    .update([fromUserId, toUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  /* Override cors error for front end port */
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  const jwt = require("jsonwebtoken");

  /* Socket middleware that authenticates the token and creates a secure socket connection for chat */
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication error: No token"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      // attach user to socket fromUserId can be fetched from here and not needed to be sent from the frontEnd
      socket.user = decoded;

      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  /* 
  Notes:
    Instead of this >>>> const roomId = [fromUserId, toUserId].sort().join("_");
    Make the roomId more secure (some How > google it > something like crypto hash) 
    So, it will be more secure.
*/
  io.on("connection", (socket) => {
    // const { token } = socket.handshake.auth;
    // if (token) {
    //   const { _id } = jwt.verify(token, process.env.JWT_SECRET_KEY);
    //   console.log("🚀 ~ socket.js:33 ~ initializeSocket ~ _id:", _id);
    // }

    socket.on("connectError", (err) => {
      if (err.message === "Invalid token" || err.message === "No token") {
        console.log("Auth failed");
      }
    });

    socket.on("joinChat", ({ fromUserId, toUserId, firstName }) => {
      const roomId = getSecureRoomId(fromUserId, toUserId);
      console.log(firstName + " Joined the Chat in " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ fromUserId, toUserId, firstName, message }) => {
        try {
          const roomId = getSecureRoomId(fromUserId, toUserId);
          console.log(
            firstName + " sent a message " + message + " in " + roomId,
          );

          /* Broadcast > sends the message to everyone */
          // socket.broadcast.emit("receiveMessage", {
          //   fromUserId,
          //   toUserId,
          //   firstName,
          //   message,
          // });

          /* Save message to db */
          let chat = await Chat.findOne({
            participants: { $all: [fromUserId, toUserId] },
          });
          if (!chat) {
            chat = await Chat({
              participants: [fromUserId, toUserId],
              message: [],
            });
          }
          chat.message.push({ senderId: fromUserId, text: message });
          await chat.save();

          const data = { fromUserId, toUserId, firstName, message };
          /* Broadcast the message to the sender */
          io.to(roomId).emit("receiveMessage", data);
        } catch (error) {
          console.error("ERROR IN Chat", error);
        }
      },
    );

    socket.on("disconnect", () => {
      console.log(" disconnect triggered ");
    });
  });
};

module.exports = initializeSocket;
