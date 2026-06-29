import "dotenv/config";
import http from "http";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import multer from "multer";
import mongoose from "mongoose";

import { env } from "./config/env";
import { connectDB } from "./config/db";
import { initSocketServer } from "./socket/socket.server";
import { socketAuthMiddleware } from "./socket/socket.middleware";
import { registerSocketHandlers } from "./socket/socket.handlers";
import { ApiError } from "./utils/ApiError";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import roomRoutes from "./modules/rooms/room.routes";
import fileRoutes from "./modules/files/file.routes";

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(env.isProduction ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomRoutes);
app.use("/files", fileRoutes);

// Unknown route
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler — the single place that turns errors into `{ error }`.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    res.status(status).json({ error: err.message });
    return;
  }
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = http.createServer(app);

const io = initSocketServer(server);
io.use(socketAuthMiddleware);
io.on("connection", (socket) => registerSocketHandlers(io, socket));

async function start() {
  await connectDB();
  server.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

start().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

function shutdown(signal: string) {
  console.log(`\n${signal} received — shutting down gracefully...`);
  io.close();
  server.close(() => {
    mongoose.disconnect().finally(() => process.exit(0));
  });
  // Hard exit if connections don't drain in time.
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
