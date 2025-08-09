import Fastify from "fastify";
import cors from "@fastify/cors";
import { PrismaClient } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Server as SocketIOServer } from "socket.io";

import authRoutes from "./routes/auth.js";
import boardRoutes from "./routes/boards.js";
import taskRoutes from "./routes/tasks.js";
import aiRoutes from "./routes/ai.js";
import analyticsRoutes from "./routes/analytics.js";

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const fastify = Fastify({
  logger: true,
});

const allowedOrigins = [
  process.env.SOCKET_CORS_ORIGIN || "http://localhost:5173",
  "http://localhost:5173",
];

// Register plugins
fastify.register(cors, {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});

const io = new SocketIOServer(fastify.server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

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

fastify.decorate("prisma", prisma);
fastify.decorate("genAI", genAI);
fastify.decorate("io", io);

await fastify.register(authRoutes, { prefix: "/api/auth" });
await fastify.register(boardRoutes, { prefix: "/api/boards" });
await fastify.register(taskRoutes, { prefix: "/api/tasks" });
await fastify.register(aiRoutes, { prefix: "/api/ai" });
await fastify.register(analyticsRoutes, { prefix: "/api/analytics" });

fastify.get("/api/health", async () => {
  return { status: "ok", timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || "3001");

    await fastify.listen({ port, host: "0.0.0.0" });

    console.log(
      `Server running on ${
        process.env.NODE_ENV === "production"
          ? `https://yourdomain.com`
          : `http://localhost:${port}`
      }`
    );
  } catch (err) {
    fastify.log.error(err);
    await prisma.$disconnect();
    process.exit(1);
  }
};

start();
