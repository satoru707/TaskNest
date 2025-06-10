const authRoutes = async (fastify) => {
  const prisma = fastify.prisma;

  // Get or create user from Auth0 profile
  fastify.post("/profile", async (request, reply) => {
    try {
      const { auth0Id, email, name, avatar } = request.body;

      let user = await prisma.user.findUnique({
        where: { auth0Id },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            auth0Id,
            email,
            name,
            avatar,
          },
        });
      } else {
        // Update user info if it has changed
        user = await prisma.user.update({
          where: { auth0Id },
          data: {
            email,
            name,
            avatar,
          },
        });
      }

      return { user };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to process user profile" });
    }
  });

  // Get user profile
  fastify.get("/profile/:auth0Id", async (request, reply) => {
    try {
      const { auth0Id } = request.params;

      const user = await prisma.user.findUnique({
        where: { auth0Id },
        include: {
          ownedBoards: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
          boardMembers: {
            include: {
              board: true,
            },
          },
        },
      });

      if (!user) {
        reply.status(404).send({ error: "User not found" });
        return;
      }

      return { user };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch user profile" });
    }
  });

  // Update user profile
  fastify.put("/profile/:auth0Id", async (request, reply) => {
    try {
      const { auth0Id } = request.params;
      const { name, avatar } = request.body;

      const user = await prisma.user.update({
        where: { auth0Id },
        data: {
          ...(name && { name }),
          ...(avatar && { avatar }),
        },
      });

      return { user };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to update user profile" });
    }
  });
};

export default authRoutes;
