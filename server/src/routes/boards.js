const boardRoutes = async (fastify) => {
  const prisma = fastify.prisma;
  const io = fastify.io;

  // Get all boards for a user
  fastify.get("/", async (request, reply) => {
    try {
      const { userId } = request.query;
      var boards;
      if (userId === "a") {
        boards = await prisma.board.findMany({
          where: {
            OR: [{ isPublic: true }],
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
      } else {
        boards = await prisma.board.findMany({
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
      }

      return { boards };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch boards" });
    }
  });

  fastify.get("/:listId/list", (request, reply) => {
    const { listId } = request.params;
    const board = prisma.list.findUnique({
      where: { id: listId },
    });
    return board;
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

      const userExists = await prisma.user.findUnique({
        where: { id: ownerId }, // or auth0Id if you use that
      });
      // error is here
      const board = await prisma.board.create({
        data: {
          title,
          description,
          ownerId: userExists.id, // Validate userExists.id exists
          isPublic: isPublic ?? false, // More explicit nullish coalescing
        },
        include: {
          owner: true, // Only include frequently used relations
        },
      });
      // Create activity
      await prisma.activity.create({
        data: {
          type: "BOARD_CREATED",
          data: { boardTitle: title },
          boardId: board.id,
          userId: userExists.id,
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
      const existingMember = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      });
      if (existingMember) {
        reply
          .status(409)
          .send({ error: "User is already a member of this board" });
        return;
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        reply.status(404).send({ error: "User not found" });
        return;
      }

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

      await prisma.activity.create({
        data: {
          type: "MEMBER_ADDED",
          data: { memberName: member.user.name, role },
          boardId,
          userId,
        },
      });
      // console.log("Member added:", member);
      io.to(`board-${boardId}`).emit("member-added", { member });

      return { member };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to add member" });
    }
  });

  fastify.put("/:boardId/archive", async (request, reply) => {
    try {
      const { boardId } = request.params;
      const { isArchived, userId } = request.body;
      const board = await prisma.board.update({
        where: { id: boardId },
        data: {
          isArchived: isArchived,
          ...(isArchived && { archivedAt: new Date() }),
        },
      });

      await prisma.activity.create({
        data: {
          type: isArchived == true ? "BOARD_ARCHIVED" : "BOARD_UNARCHIVED",
          boardId,
          userId: userId,
          data: { isArchived },
        },
      });
      return { board };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to archive board" });
    }
  });

  fastify.put("/:boardId/bookmark", async (request, reply) => {
    try {
      const { boardId } = request.params;
      const { isBookMarked, userId } = request.body;
      const board = await prisma.board.update({
        where: { id: boardId },
        data: {
          isBookMarked: isBookMarked,
          ...(isBookMarked && { bookMarkedAt: new Date() }),
        },
      });

      await prisma.activity.create({
        data: {
          type:
            isBookMarked == true ? "BOARD_BOOKMARKED" : "BOARD_UNBOOKMARKED",
          boardId,
          userId: userId,
          data: { isBookMarked },
        },
      });
      return { board };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to archive board" });
    }
  });

  fastify.put("/:boardId/lists/:listId/archive", async (request, reply) => {
    try {
      const { boardId, listId } = request.params;
      const { isArchived, userId } = request.body;
      const list = await prisma.list.update({
        where: { id: listId, boardId: boardId },
        data: {
          isArchived: isArchived,
          ...(isArchived && { archivedAt: new Date() }),
        },
      });
      await prisma.activity.create({
        data: {
          type: isArchived == true ? "LIST_ARCHIVED" : "LIST_UNARCHIVED",
          boardId,
          userId: userId,
          data: { isArchived },
        },
      });
      io.to(`board-${boardId}`).emit("list-updated", { list });
      return { list };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to archive list" });
    }
  });

  fastify.put("/:boardId/lists/:listId/bookmark", async (request, reply) => {
    try {
      const { boardId, listId } = request.params;
      const { isBookMarked, userId } = request.body;
      const list = await prisma.list.update({
        where: { id: listId, boardId: boardId },
        data: {
          isBookMarked: isBookMarked,
          ...(isBookMarked && { bookMarkedAt: new Date() }),
        },
      });

      await prisma.activity.create({
        data: {
          type: isBookMarked == true ? "LIST_BOOKMARKED" : "LIST_UNBOOKMARKED",
          boardId,
          userId: userId,
        },
      });
      io.to(`board-${boardId}`).emit("list-updated", { list });
      return { list };
    } catch (err) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to bookmark list" });
    }
  });

  fastify.put("/:boardId/members/:memberId", async (request, reply) => {
    try {
      const { boardId, memberId } = request.params;
      const { role } = request.body;
      // console.log("data init", boardId, memberId, role);
      const member = await prisma.boardMember.update({
        where: {
          boardId_userId: {
            // Use compound unique input
            boardId: boardId,
            userId: memberId,
          },
        },
        data: { role },
        include: { user: true },
      });
      // Create activity
      await prisma.activity.create({
        data: {
          type: "MEMBER_UPDATED",
          data: { memberName: member.user.name, newRole: role },
          boardId,
          userId: member.userId,
        },
      });

      // // Emit real-time update
      io.to(`board-${boardId}`).emit("member-updated", { member });

      return { member };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to update member role" });
    }
  });

  fastify.delete("/:boardId/members/:memberId", async (request, reply) => {
    try {
      const { boardId, memberId } = request.params;
      const member = await prisma.boardMember.findUnique({
        where: {
          boardId_userId: {
            boardId: boardId,
            userId: memberId,
          },
        },
        include: { user: true },
      });
      if (!member) {
        reply.status(404).send({ error: "Member not found" });
        return;
      }

      await prisma.boardMember.delete({
        where: {
          boardId_userId: {
            boardId: boardId,
            userId: memberId,
          },
        },
      });

      // Create activity
      await prisma.activity.create({
        data: {
          type: "MEMBER_REMOVED",
          data: { memberName: member.user.name },
          boardId,
          userId: member.userId,
        },
      });

      // Emit real-time update
      io.to(`board-${boardId}`).emit("member-removed", { memberId });

      return { success: true };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to remove member" });
    }
  });

  // Create a new list
  fastify.post("/:boardId/lists", async (request, reply) => {
    try {
      const { boardId } = request.params;
      const { title, position } = request.body;

      // console.log(
      //   `Creating list for board ${boardId} with title: ${title}\nPosition: ${position}`
      // );
      //get the number of lists with board id
      const lists = await prisma.list.findMany({
        where: { boardId: boardId },
        select: { position: true },
      });
      const new_position = lists.length + 1;

      const list = await prisma.list.create({
        data: {
          title,
          position: new_position,
          board: {
            connect: { id: boardId },
          },
          position: new_position,
        },
        include: {
          tasks: true,
          board: true,
        },
      });
      //Continue from here
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
        where: { id: listId, boardId: boardId },
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
        where: { id: listId, boardId: boardId },
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
