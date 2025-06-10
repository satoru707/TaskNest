import path from "path";
import fs from "fs/promises";
import { pipeline } from "stream/promises";

const uploadRoutes = async (fastify) => {
  const prisma = fastify.prisma;
  const io = fastify.io;

  // Upload file attachment
  fastify.post("/attachments", async (request, reply) => {
    try {
      const data = await request.file();

      if (!data) {
        reply.status(400).send({ error: "No file uploaded" });
        return;
      }

      const { taskId, uploadedById } = request.body;

      if (!taskId || !uploadedById) {
        reply.status(400).send({ error: "Missing taskId or uploadedById" });
        return;
      }

      // Generate unique filename
      const fileExtension = path.extname(data.filename);
      const uniqueFilename = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}${fileExtension}`;
      const uploadDir = process.env.UPLOAD_DIR || "./uploads";
      const filePath = path.join(uploadDir, uniqueFilename);

      // Save file to disk
      await pipeline(data.file, fs.createWriteStream(filePath));

      // Get file stats
      const stats = await fs.stat(filePath);

      // Save attachment record to database
      const attachment = await prisma.attachment.create({
        data: {
          filename: uniqueFilename,
          originalName: data.filename,
          mimeType: data.mimetype,
          size: stats.size,
          url: `/api/uploads/files/${uniqueFilename}`,
          taskId,
          uploadedById,
        },
        include: {
          uploadedBy: true,
          task: {
            include: {
              list: {
                include: {
                  board: true,
                },
              },
            },
          },
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "ATTACHMENT_ADDED",
          data: {
            taskTitle: attachment.task.title,
            filename: attachment.originalName,
          },
          boardId: attachment.task.list.board.id,
          taskId: attachment.task.id,
          userId: uploadedById,
        },
      });

      // Emit real-time update
      io.to(`board-${attachment.task.list.board.id}`).emit("attachment-added", {
        attachment,
      });

      return { attachment };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to upload file" });
    }
  });

  // Serve uploaded files
  fastify.get("/files/:filename", async (request, reply) => {
    try {
      const { filename } = request.params;
      const uploadDir = process.env.UPLOAD_DIR || "./uploads";
      const filePath = path.join(uploadDir, filename);

      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        reply.status(404).send({ error: "File not found" });
        return;
      }

      // Get file info from database
      const attachment = await prisma.attachment.findFirst({
        where: { filename },
      });

      if (!attachment) {
        reply.status(404).send({ error: "File not found in database" });
        return;
      }

      // Set appropriate headers
      reply.header("Content-Type", attachment.mimeType);
      reply.header(
        "Content-Disposition",
        `inline; filename="${attachment.originalName}"`
      );

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      return reply.send(fileStream);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to serve file" });
    }
  });

  // Delete attachment
  fastify.delete("/attachments/:attachmentId", async (request, reply) => {
    try {
      const { attachmentId } = request.params;

      const attachment = await prisma.attachment.findUnique({
        where: { id: attachmentId },
        include: {
          task: {
            include: {
              list: {
                include: {
                  board: true,
                },
              },
            },
          },
        },
      });

      if (!attachment) {
        reply.status(404).send({ error: "Attachment not found" });
        return;
      }

      // Delete file from disk
      const uploadDir = process.env.UPLOAD_DIR || "./uploads";
      const filePath = path.join(uploadDir, attachment.filename);

      try {
        await fs.unlink(filePath);
      } catch (error) {
        fastify.log.warn("Failed to delete file from disk:", error);
      }

      // Delete from database
      await prisma.attachment.delete({
        where: { id: attachmentId },
      });

      // Emit real-time update
      io.to(`board-${attachment.task.list.board.id}`).emit(
        "attachment-deleted",
        { attachmentId }
      );

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to delete attachment" });
    }
  });

  // Upload user avatar
  fastify.post("/avatar", async (request, reply) => {
    try {
      const data = await request.file();

      if (!data) {
        reply.status(400).send({ error: "No file uploaded" });
        return;
      }

      const { userId } = request.body;

      if (!userId) {
        reply.status(400).send({ error: "Missing userId" });
        return;
      }

      // Validate file type
      if (!data.mimetype.startsWith("image/")) {
        reply.status(400).send({ error: "Only image files are allowed" });
        return;
      }

      // Generate unique filename
      const fileExtension = path.extname(data.filename);
      const uniqueFilename = `avatar-${userId}-${Date.now()}${fileExtension}`;
      const uploadDir = process.env.UPLOAD_DIR || "./uploads";
      const filePath = path.join(uploadDir, uniqueFilename);

      // Save file to disk
      await pipeline(data.file, fs.createWriteStream(filePath));

      // Update user avatar in database
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          avatar: `/api/uploads/files/${uniqueFilename}`,
        },
      });

      return { user };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to upload avatar" });
    }
  });
};

export default uploadRoutes;
