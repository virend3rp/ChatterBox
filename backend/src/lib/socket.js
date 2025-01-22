import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS for frontend to connect
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // Frontend URL
    methods: ["GET", "POST"],
  },
});

// Object to keep track of userId -> socketId mapping
const userSocketMap = {}; // {userId: socketId}

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// Socket connection event
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // Extract userId from query params in handshake
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    // Save userId and socketId in the map
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} connected`);
  } else {
    console.log("No userId in the connection request.");
  }

  // Emit the updated list of online users
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection event
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);

    if (userId && userSocketMap[userId]) {
      // Remove user from the socket map upon disconnect
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected`);
    }
    
    // Emit the updated list of online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export the server and socket.io instance
export { io, app, server };
