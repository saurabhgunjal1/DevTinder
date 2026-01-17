const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("_"))
    .digest("hex");
};

const initializeSocket = (server) => {
  const io = socket(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomID = getSecretRoomId(userId, targetUserId);
      // console.log(firstName + "Joining room:" + roomID);

      socket.join(roomID);
    });
    socket.on(
      "sendMessage",
      async ({ firstName, userId, targetUserId, text }) => {
        try {
          const roomID = getSecretRoomId(userId, targetUserId);
          // console.log(firstName + " " + text);

          let chat = await Chat.findOne({
            participants: { $all: [userId, targetUserId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [userId, targetUserId],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            text,
          });

          await chat.save();
          io.to(roomID).emit("messageRecived", { firstName, text });
        } catch (error) {
          console.log(error);
        }
      },
    );
    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;
