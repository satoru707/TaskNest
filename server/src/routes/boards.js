const boardRoutes = async (fastify) => {
  const prisma = fastify.prisma;
  const io = fastify.io;

  // Get all boards for a user
  fastify.get("/", async (request, reply) => {
    try {
      const { userId } = request.query;

      const boards = await prisma.board.findMany({
        where: {
          OR: [
            { ownerId: userId },
            {
              members: {
                some: {
                  userId,
                },
              },
            },
          ],
        },
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
          lists: {
            include: {
              tasks: {
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
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
          _count: {
            select: {
              lists: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return { boards };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch boards" });
    }
  });

  // Get a specific board
  fastify.get("/:boardId", async (request, reply) => {
    try {
      const { boardId } = request.params;

      const board = await prisma.board.findUnique({
        where: { id: boardId },
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
          lists: {
            include: {
              tasks: {
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
                },
                orderBy: {
                  position: "asc",
                },
              },
            },
            orderBy: {
              position: "asc",
            },
          },
          labels: true,
        },
      });

      if (!board) {
        reply.status(404).send({ error: "Board not found" });
        return;
      }

      return { board };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch board" });
    }
  });

  // Create a new board
  fastify.post("/", async (request, reply) => {
    try {
      const { title, description, ownerId, isPublic } = request.body;
      const board = await prisma.board.create({
        data: {
          title,
          description,
          ownerId,
          isPublic: isPublic || false,
        },
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
          lists: true,
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "BOARD_CREATED",
          data: { boardTitle: title },
          boardId: board.id,
          userId: ownerId,
        },
      });

      return { board };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to create board" });
    }
  });

  // Update a board
  fastify.put("/:boardId", async (request, reply) => {
    try {
      const { boardId } = request.params;
      const { title, description, isPublic } = request.body;
      const board = await prisma.board.update({
        where: { id: boardId },
        data: {
          ...(title && { title }),
          ...(description !== undefined && { description }),
          ...(isPublic !== undefined && { isPublic }),
        },
        include: {
          owner: true,
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      // Emit real-time update
      io.to(`board-${boardId}`).emit("board-updated", { board });

      return { board };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to update board" });
    }
  });

  // Delete a board
  fastify.delete("/:boardId", async (request, reply) => {
    try {
      const { boardId } = request.params;

      await prisma.board.delete({
        where: { id: boardId },
      });

      // Emit real-time update
      io.to(`board-${boardId}`).emit("board-deleted", { boardId });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to delete board" });
    }
  });

  // Add member to board
  fastify.post("/:boardId/members", async (request, reply) => {
    try {
      const { boardId } = request.params;
      const { userId, role } = request.body;
      const member = await prisma.boardMember.create({
        data: {
          boardId,
          userId,
          role,
        },
        include: {
          user: true,
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "MEMBER_ADDED",
          data: { memberName: member.user.name, role },
          boardId,
          userId,
        },
      });

      // Emit real-time update
      io.to(`board-${boardId}`).emit("member-added", { member });

      return { member };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to add member" });
    }
  });

  // Create a new list
  fastify.post("/:boardId/lists", async (request, reply) => {
    try {
      const { boardId } = request.params;
      const { title, position } = request.body;
      const list = await prisma.list.create({
        data: {
          title,
          boardId,
          position,
        },
        include: {
          tasks: true,
        },
      });

      // Emit real-time update
      io.to(`board-${boardId}`).emit("list-created", { list });

      return { list };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to create list" });
    }
  });

  // Update list
  fastify.put("/:boardId/lists/:listId", async (request, reply) => {
    try {
      const { boardId, listId } = request.params;
      const { title, position } = request.body;

      const list = await prisma.list.update({
        where: { id: listId },
        data: {
          ...(title && { title }),
          ...(position !== undefined && { position }),
        },
        include: {
          tasks: true,
        },
      });

      // Emit real-time update
      io.to(`board-${boardId}`).emit("list-updated", { list });

      return { list };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to update list" });
    }
  });

  // Delete list
  fastify.delete("/:boardId/lists/:listId", async (request, reply) => {
    try {
      const { boardId, listId } = request.params;

      await prisma.list.delete({
        where: { id: listId },
      });

      // Emit real-time update
      io.to(`board-${boardId}`).emit("list-deleted", { listId });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to delete list" });
    }
  });
};

export default boardRoutes;
