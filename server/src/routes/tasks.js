const taskRoutes = async (fastify) => {
  const prisma = fastify.prisma;
  const io = fastify.io;

  // Create a new task
  fastify.post("/", async (request, reply) => {
    try {
      const {
        title,
        description,
        listId,
        position,
        dueDate,
        priority,
        createdById,
        assigneeIds,
        labelIds,
      } = request.body;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          listId,
          position,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: priority || "MEDIUM",
          createdById,
          assignees: assigneeIds
            ? {
                create: assigneeIds.map((userId) => ({ userId })),
              }
            : undefined,
          labels: labelIds
            ? {
                create: labelIds.map((labelId) => ({ labelId })),
              }
            : undefined,
        },
        include: {
          assignees: {
            include: {
              user: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          checklistItems: true,
          comments: {
            include: {
              user: true,
            },
          },
          attachments: true,
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "TASK_CREATED",
          data: { taskTitle: title },
          boardId: task.list.board.id,
          taskId: task.id,
          userId: createdById,
        },
      });

      // Emit real-time update
      io.to(`board-${task.list.board.id}`).emit("task-created", { task });

      return { task };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to create task" });
    }
  });

  // Update a task
  fastify.put("/:taskId", async (request, reply) => {
    try {
      const { taskId } = request.params;
      const {
        title,
        description,
        listId,
        position,
        dueDate,
        priority,
        completed,
        assigneeIds,
        labelIds,
      } = request.body;
      // Get current task to check for list change
      const currentTask = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      if (!currentTask) {
        reply.status(404).send({ error: "Task not found" });
        return;
      }

      // Update assignees if provided
      if (assigneeIds) {
        await prisma.taskAssignee.deleteMany({
          where: { taskId },
        });

        if (assigneeIds.length > 0) {
          await prisma.taskAssignee.createMany({
            data: assigneeIds.map((userId) => ({ taskId, userId })),
          });
        }
      }

      // Update labels if provided
      if (labelIds) {
        await prisma.taskLabel.deleteMany({
          where: { taskId },
        });

        if (labelIds.length > 0) {
          await prisma.taskLabel.createMany({
            data: labelIds.map((labelId) => ({ taskId, labelId })),
          });
        }
      }

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(listId && { listId }),
          ...(position !== undefined && { position }),
          ...(dueDate !== undefined && {
            dueDate: dueDate ? new Date(dueDate) : null,
          }),
          ...(priority && { priority }),
          ...(completed !== undefined && { completed }),
        },
        include: {
          assignees: {
            include: {
              user: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          checklistItems: {
            orderBy: {
              position: "asc",
            },
          },
          comments: {
            include: {
              user: true,
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          attachments: {
            include: {
              uploadedBy: true,
            },
          },
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      // Create activity for task move
      if (listId && listId !== currentTask.listId) {
        await prisma.activity.create({
          data: {
            type: "TASK_MOVED",
            data: {
              taskTitle: task.title,
              fromList: currentTask.list.title,
              toList: task.list.title,
            },
            boardId: task.list.board.id,
            taskId: task.id,
            userId: currentTask.createdById,
          },
        });
      }

      // Create activity for task completion
      if (completed !== undefined && completed !== currentTask.completed) {
        await prisma.activity.create({
          data: {
            type: "TASK_COMPLETED",
            data: { taskTitle: task.title, completed },
            boardId: task.list.board.id,
            taskId: task.id,
            userId: currentTask.createdById,
          },
        });
      }

      // Emit real-time update
      io.to(`board-${task.list.board.id}`).emit("task-updated", { task });

      return { task };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to update task" });
    }
  });

  // Delete a task
  fastify.delete("/:taskId", async (request, reply) => {
    try {
      const { taskId } = request.params;

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      if (!task) {
        reply.status(404).send({ error: "Task not found" });
        return;
      }

      await prisma.task.delete({
        where: { id: taskId },
      });

      // Emit real-time update
      io.to(`board-${task.list.board.id}`).emit("task-deleted", { taskId });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to delete task" });
    }
  });

  // Add comment to task
  fastify.post("/:taskId/comments", async (request, reply) => {
    try {
      const { taskId } = request.params;
      const { content, userId } = request.body;
      const comment = await prisma.comment.create({
        data: {
          content,
          taskId,
          userId,
        },
        include: {
          user: true,
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
          type: "COMMENT_ADDED",
          data: { taskTitle: comment.task.title, comment: content },
          boardId: comment.task.list.board.id,
          taskId: comment.task.id,
          userId,
        },
      });

      // Emit real-time update
      io.to(`board-${comment.task.list.board.id}`).emit("comment-added", {
        comment,
      });

      return { comment };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to add comment" });
    }
  });

  // Add checklist item
  fastify.post("/:taskId/checklist", async (request, reply) => {
    try {
      const { taskId } = request.params;
      const { title, position } = request.body;

      const checklistItem = await prisma.checklistItem.create({
        data: {
          title,
          taskId,
          position,
        },
      });

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      // Emit real-time update
      io.to(`board-${task?.list.board.id}`).emit("checklist-item-added", {
        checklistItem,
        taskId,
      });

      return { checklistItem };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to add checklist item" });
    }
  });

  // Update checklist item
  fastify.put("/:taskId/checklist/:itemId", async (request, reply) => {
    try {
      const { taskId, itemId } = request.params;
      const { title, completed } = request.body;

      const checklistItem = await prisma.checklistItem.update({
        where: { id: itemId },
        data: {
          ...(title && { title }),
          ...(completed !== undefined && { completed }),
        },
      });

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      // Emit real-time update
      io.to(`board-${task?.list.board.id}`).emit("checklist-item-updated", {
        checklistItem,
        taskId,
      });

      return { checklistItem };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to update checklist item" });
    }
  });

  // Delete checklist item
  fastify.delete("/:taskId/checklist/:itemId", async (request, reply) => {
    try {
      const { taskId, itemId } = request.params;

      await prisma.checklistItem.delete({
        where: { id: itemId },
      });

      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          list: {
            include: {
              board: true,
            },
          },
        },
      });

      // Emit real-time update
      io.to(`board-${task?.list.board.id}`).emit("checklist-item-deleted", {
        itemId,
        taskId,
      });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to delete checklist item" });
    }
  });
};

export default taskRoutes;
