import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";
import cloudinary from "cloudinary";
import { connectDB } from "./lib/dbConnect.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json({limit:"1mb"}));
app.use(express.urlencoded({ limit: "1mb", extended: true }));
app.use(cookieParser());

const corsOptions = {
  origin: 'http://localhost:5173', // The URL of your frontend application
  methods: ['GET', 'POST', 'PUT'], // Allow PUT method along with GET and POST
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow headers for content type and authorization
  credentials: true
};
app.use(cors(corsOptions)); // Apply the CORS configuration

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});