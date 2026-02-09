import http from "http";
import os from "os";
import express from "express";
import "dotenv/config"
import cors from "cors";
import { connectDB } from "./config/db";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import chatRoutes from "./modules/chats/chat.routes";
import messageRoutes from "./modules/messages/message.routes";

const PORT = process.env.PORT;
const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log("CPU cores:", os.cpus().length);
  console.log("Total Memory:", (os.totalmem() / 1e9).toFixed(2), "GB");
  console.log("Free Memory:", (os.freemem() / 1e9).toFixed(2), "GB");
});