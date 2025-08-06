import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Server } from "socket.io";
import fs from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import routes
import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";
import "dotenv/config";

// Initialize services
const AI_KEY = process.env.GEMINI_API_KEY;
const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(AI_KEY);
let io;
// const { FastifyPluginAsync } = Fastify;

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

fastify.register(multipart, {
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || "10485760"), // 10MB
  },
});

// Add services to fastify instance
fastify.decorate("prisma", prisma);
fastify.decorate("genAI", genAI);
fastify.decorate("io", null);

// Register routes
fastify.register(authRoutes, { prefix: "/api/auth" });
fastify.register(boardRoutes, { prefix: "/api/boards" });
fastify.register(taskRoutes, { prefix: "/api/tasks" });
fastify.register(aiRoutes, { prefix: "/api/ai" });
fastify.register(analyticsRoutes, { prefix: "/api/analytics" });

// Health check
fastify.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

// figure using sockets with fastify server
async function startServer() {
  try {
    const port = parseInt(process.env.PORT || "3000");
    await fastify.listen({
      port,
      host: "0.0.0.0",
    });

    const io = new Server(fastify.server, {
      cors: {
        origin: [process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    fastify.io = io;
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

    fastify.log.info(`Server and WebSocket listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();
