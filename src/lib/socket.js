 import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// middleware   JWT
io.use(socketAuthMiddleware);

 
const userSocketMap = {}; // { userId: socketId }

 
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.userId;
  const fullName = socket.user.name;

  console.log(`A user connected: ${fullName} (${userId})`);
  userSocketMap[userId] = socket.id;

  // all online users now 
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ====================== SOCKET EVENTS ======================

 // send massage 
  socket.on("sendMessage", async ({ chatId, receiverId, content }) => {
    io.to(getReceiverSocketId(receiverId))?.emit("newMessage", {
      sender: userId,
      content,
      chatId,
    });
  });

   // edit message
  socket.on("editMessage", ({ chatId, messageId, content, receiverId }) => {
    io.to(getReceiverSocketId(receiverId))?.emit("messageEdited", {
      chatId,
      messageId,
      content,
    });
  });

  // delete 
  socket.on("deleteMessage", ({ chatId, messageId, receiverId }) => {
    io.to(getReceiverSocketId(receiverId))?.emit("messageDeleted", {
      chatId,
      messageId,
    });
  });

 
  socket.on("markAsSeen", ({ chatId, receiverId }) => {
    io.to(getReceiverSocketId(receiverId))?.emit("messagesSeen", {
      chatId,
      seenBy: userId,
    });
  });

  
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${fullName} (${userId})`);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
