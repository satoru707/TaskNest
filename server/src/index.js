import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Server as SocketIOServer } from "socket.io";
import fs from "fs/promises";

// Import routes
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";

// Initialize services
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fastify = Fastify({
  logger: true,
});

// Register plugins
fastify.register(cors, {
  origin: ["http://localhost:5173", process.env.SOCKET_CORS_ORIGIN],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

// Initialize Socket.IO
const io = new SocketIOServer(fastify.server, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-board", (boardId) => {
    socket.join(`board-${boardId}`);
    console.log(`User ${socket.id} joined board ${boardId}`);
  });

  socket.on("leave-board", (boardId) => {
    socket.leave(`board-${boardId}`);
    console.log(`User ${socket.id} left board ${boardId}`);
  });

  socket.on("task-updated", (data) => {
    socket.to(`board-${data.boardId}`).emit("task-updated", data);
  });

  socket.on("board-updated", (data) => {
    socket.to(`board-${data.boardId}`).emit("board-updated", data);
  });

  socket.on("task-created", (data) => {
    socket.to(`board-${data.boardId}`).emit("task-created", data);
  });

  socket.on("list-created", (data) => {
    socket.to(`board-${data.boardId}`).emit("list-created", data);
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
  await fs.access(uploadDir);
} catch {
  await fs.mkdir(uploadDir, { recursive: true });
}

// Register routes
await fastify.register(authRoutes, { prefix: "/api/auth" });
await fastify.register(boardRoutes, { prefix: "/api/boards" });
await fastify.register(taskRoutes, { prefix: "/api/tasks" });
await fastify.register(aiRoutes, { prefix: "/api/ai" });
await fastify.register(analyticsRoutes, { prefix: "/api/analytics" });

// Health check
fastify.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3001");
    await fastify.listen({ port, host: "0.0.0.0" });
    console.log(`Server running on http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
