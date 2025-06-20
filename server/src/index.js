import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import websocket from "@fastify/websocket";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Server as SocketIOServer } from "socket.io";
import { createServer } from "http";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = join(__dirname, "uploads");
const uploaDir = join(__dirname, "../uploads");

try {
  await fs.access(uploadsDir);
} catch {
  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.mkdir(uploaDir, { recursive: true });
  console.log("Uploads directory created");
}
// Import routes
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";
import uploadRoutes from "./routes/uploads.js";
import analyticsRoutes from "./routes/analytics.js";
import "dotenv/config";

// Initialize services
const AI_KEY = process.env.GEMINI_API_KEY;
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(AI_KEY);
const { FastifyPluginAsync } = Fastify;

const fastify = Fastify({
  logger: true,
});

// Register plugins
fastify.register(cors, {
  origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
  credentials: true,
});

fastify.register(multipart, {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
  },
});
fastify.register(websocket);

// Create HTTP server for Socket.IO
const server = createServer(fastify.server);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000/socket.io",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join board room
  socket.on("join-board", (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  // Leave board room
  socket.on("leave-board", (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`User ${socket.id} left board ${boardId}`);
  });

  // Handle real-time task updates
  socket.on("task-updated", (data) => {
    socket.to(`board-${data.boardId}`).emit("task-updated", data);
  });

  // Handle real-time board updates
  socket.on("board-updated", (data) => {
    socket.to(`board-${data.boardId}`).emit("board-updated", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Add services to fastify instance
fastify.decorate("prisma", prisma);
fastify.decorate("genAI", genAI);
fastify.decorate("io", io);

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || "./uploads";
try {
  fs.access(uploadDir);
} catch {
  fs.mkdir(uploadDir, { recursive: true });
}

// Register routes
fastify.register(authRoutes, { prefix: "/api/auth" });
fastify.register(boardRoutes, { prefix: "/api/boards" });
fastify.register(taskRoutes, { prefix: "/api/tasks" });
fastify.register(aiRoutes, { prefix: "/api/ai" });
fastify.register(uploadRoutes, { prefix: "/api/uploads" });
fastify.register(analyticsRoutes, { prefix: "/api/analytics" });

// Health check
fastify.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start server
async function start() {
  try {
    const port = parseInt(process.env.PORT || "3001");
    await fastify.listen({
      port,
      host: "0.0.0.0",
    });
    console.log(`Server running on PORT ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();
