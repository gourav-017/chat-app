import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables

import express from "express";
import cors from "cors";
import http from "http";
import fs from "fs";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";

// Check if .env file exists
console.log("🧪 .env file exists:", fs.existsSync(".env"));

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
export const io = new Server(server, {
  cors: {
    origin: "*", // or replace with specific domain like "http://localhost:3000"
  },
});

// ✅ Fixed: Store multiple socket IDs per user
export const userSocketMap = {}; // { userId: Set(socketIds) }

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ New client connected:", userId);

  if (userId) {
    if (!userSocketMap[userId]) {
      userSocketMap[userId] = new Set();
    }
    userSocketMap[userId].add(socket.id);
  }

  // Emit updated list of online users to all connected clients
  io.emit("onlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", userId);

    if (userId && userSocketMap[userId]) {
      userSocketMap[userId].delete(socket.id);

      // If user has no remaining sockets, remove them from online list
      if (userSocketMap[userId].size === 0) {
        delete userSocketMap[userId];
      }
    }

    // Emit updated list after disconnection
    io.emit("onlineUsers", Object.keys(userSocketMap));
  });
});

// Middleware setup
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// Routes
app.use("/api/status", (req, res) => res.send("Server is running"));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

// Connect to MongoDB
await connectDB();

// Start server
if(process.env.NODE_ENV !== "production") {
  
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
}
export default server;
