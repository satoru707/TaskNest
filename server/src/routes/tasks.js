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
        dueDate,
        priority,
        createdById,
        assigneeIds,
        labelIds,
        auth0Id,
      } = request.body;

      // console.log("autjiwjiwr", auth0Id);

      const user = await prisma.user.findUnique({
        where: { auth0Id: createdById },
        select: { id: true },
      });
      const the_idfromuser = user.id;
      //get the number of tasks in that list using listid and get the number 0f tasks in that list and add one to the number of tasks
      const list = await prisma.list.findUnique({
        where: { id: listId },
        select: { tasks: true },
      });
      const tasks = list.tasks;
      const newTaskCount = tasks.length + 1;

      const task = await prisma.task.create({
        data: {
          title,
          description,
          position: newTaskCount,
          dueDate: dueDate ? new Date(dueDate) : null,
          priority: priority || "MEDIUM",
          // Relations
          list: {
            connect: { id: listId }, // Connect to the correct list
          },
          createdBy: {
            connect: { id: the_idfromuser }, // Connect to the user who created the task
          },
          assignees: assigneeIds
            ? {
                create: assigneeIds.map((userId) => ({
                  user: { connect: { id: userId } },
                })),
              }
            : undefined,
          labels: labelIds
            ? {
                create: labelIds.map((labelId) => ({
                  label: { connect: { id: labelId } },
                })),
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
          list: {
            include: {
              board: true,
            },
          },
          createdBy: true, // Include the creator user
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "TASK_CREATED",
          data: { taskTitle: title },
          boardId: task.list.board.id,
          taskId: task.id,
          userId: the_idfromuser,
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
        id,
        isArchived, // Destructured but will be validated
        isBookMarked, // Added for bookmarking
      } = request.body;

      // Get current task to check for list change and bookmark status
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

      // Validate and process isArchived
      let updatedIsArchived = currentTask.isArchived; // Default to current value
      if (isArchived !== undefined) {
        if (typeof isArchived !== "boolean") {
          reply.status(400).send({ error: "isArchived must be a boolean" });
          return;
        }
        updatedIsArchived = isArchived; // Update only if provided and valid
      }

      // Validate and process isBookMarked
      let updatedIsBookMarked = currentTask.isBookMarked; // Default to current value
      if (isBookMarked !== undefined) {
        if (typeof isBookMarked !== "boolean") {
          reply.status(400).send({ error: "isBookMarked must be a boolean" });
          return;
        }
        updatedIsBookMarked = isBookMarked; // Update only if provided and valid
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

      // if (id) {
      //   console.log("You used the localStorage right?");
      // }

      // Perform the task update
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
          isArchived: updatedIsArchived, // Explicitly set the validated isArchived
          isBookMarked: updatedIsBookMarked, // Explicitly set the validated isBookMarked
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

      // Create activity for archiving if changed
      if (updatedIsArchived !== currentTask.isArchived) {
        await prisma.activity.create({
          data: {
            type: updatedIsArchived ? "TASK_ARCHIVED" : "TASK_UNARCHIVED",
            data: { taskTitle: task.title, isArchived: updatedIsArchived },
            boardId: task.list.board.id,
            taskId: task.id,
            userId: currentTask.createdById,
          },
        });
      }

      // Create activity for bookmarking if changed
      if (updatedIsBookMarked !== currentTask.isBookMarked) {
        await prisma.activity.create({
          data: {
            type: updatedIsBookMarked ? "TASK_BOOKMARKED" : "TASK_UNBOOKMARKED",
            data: { taskTitle: task.title, isBookMarked: updatedIsBookMarked },
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
      reply.status(400).send({ error: "Failed to update task" }); // Changed to 400 for validation errors
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

  fastify.put("/:taskId/archive", async (request, reply) => {
    try {
      const { taskId } = request.params;
      const { isArchived, userId } = request.body;

      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          isArchived: isArchived,
          ...(isArchived && { archivedAt: new Date() }),
        },
      });

      await prisma.activity.create({
        data: {
          type: isArchived == true ? "TASK_ARCHIVED" : "TASK_UNARCHIVED",
          taskId,
          userId: userId,
          data: request.body,
        },
      });
      return { task };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to archive task" });
    }
  });

  fastify.put("/:taskId/bookmark", async (request, reply) => {
    try {
      const { taskId } = request.params;
      const { isBookMarked, userId } = request.body;
      const task = await prisma.task.update({
        where: { id: taskId },
        data: {
          isBookMarked: isBookMarked,
          ...(isBookMarked && { bookMarkedAt: new Date() }),
        },
      });

      await prisma.activity.create({
        data: {
          type: isBookMarked == true ? "TASK_BOOKMARKED" : "TASK_UNBOOKMARKED",
          taskId,
          userId: userId,
          data: request.body,
        },
      });
      return { task };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to bookmark task" });
    }
  });

  // Add comment to task
  fastify.post("/:taskId/comments", async (request, reply) => {
    try {
      const { taskId } = request.params;
      const { content, userId } = request.body;

      const get_id = await prisma.user.findUnique({
        where: { auth0Id: userId },
      });
      // console.log("Comment problem", taskId, content, userId, get_id);

      const comment = await prisma.comment.create({
        data: {
          content,
          taskId,
          userId: get_id.id,
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
          userId: get_id.id,
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
        where: { id: itemId, taskId: taskId },
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
