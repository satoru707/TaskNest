import "dotenv/config";
import axios from "axios";

const authRoutes = async (fastify) => {
  const prisma = fastify.prisma;

  fastify.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.code(400).send({ error: "Email and password are required" });
      }
      console.log(email, password);

      const existingUser = await prisma.user.findUnique({
        where: { email },
        // select: { auth0Id: true, name: true, password: true },
      });
      console.log("Existing user", existingUser);

      if (!existingUser) {
        console.log("User does not exiss");
        return res.send({
          error: "User doesn't exists!",
          success: !existingUser,
        });
      }

      if (!existingUser.password && existingUser) {
        return res.send({
          error: "This user already has an account",
          success: !existingUser,
        });
      }

      if (password !== existingUser.password) {
        return res.send({ error: "Invalid password!" });
      }

      return res.code(200).send({
        success: true,
        user,
        exists: !!existingUser,
      });
    } catch (error) {
      console.error("Full Auth0 error:", error.response?.data || error.message);

      if (error.response?.data?.error === "invalid_grant") {
        return res.code(401).send({ error: "Invalid credentials" });
      }

      return res.code(500).send({
        error: "Authentication service error",
        details: error.response?.data || error.message,
      });
    }
  });

  fastify.post("/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      console.log(email, name);

      if (!email || !password) {
        return res.code(400).send({ error: "Email and password are required" });
      }
      const existingUser = await prisma.user.findUnique({
        where: { email: email },
      });
      console.log("Existing user", existingUser);

      if (existingUser) {
        console.log("User already exists");

        //go to login
        return res.send({ error: "User exists!" });
      }
      console.log("Doesn't exost");

      const userResponse = await axios.post(
        `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
        {
          client_id: process.env.AUTH0_CLIENT_ID,
          email,
          password,
          connection: "Username-Password-Authentication",
        }
      );
      // 2. Extract Auth0 ID
      const auth0Id = userResponse.data._id;
      console.log("authId", auth0Id);
      const user = await prisma.user.create({
        data: {
          auth0Id,
          email,
          name,
        },
        select: { auth0Id: true, email: true, name: true },
      });

      return res.code(200).send({
        success: true,
        user,
        exists: !!existingUser,
      });
    } catch (error) {
      console.error("Full Auth0 error:", error.response?.data || error.message);

      if (error.response?.data?.error === "invalid_grant") {
        return res.code(401).send({ error: "Invalid credentials" });
      }

      return res.code(500).send({
        error: "Authentication service error",
        details: error.response?.data || error.message,
      });
    }
  });

  fastify.post("/checkEmail", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.code(400).send({ error: "Email is required" });
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      console.log("Checking email:", email, "Existing user:", existingUser);

      if (existingUser) {
        return res.code(200).send({ exists: true, existingUser });
      }

      return res.code(404).send({ exists: false });
    } catch (error) {
      console.error("Error checking email:", error);
      return res.code(500).send({ error: "Failed to check email" });
    }
  });

  fastify.post("/updateID", async (req, res) => {
    const { auth0Id, email } = req.body;
    try {
      if (!auth0Id || !email) {
        return res.code(400).send({ error: "Auth0 ID and Email is required" });
      }

      //check for email and inset authId
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      console.log("Existing user for update:", existingUser);
      const newUser = await prisma.user.update({
        where: { email },
        data: { auth0Id },
      });
      return res.code(201).send({ user: newUser });
    } catch (error) {
      console.error("Error updating Auth0 ID:", error);
      return res.code(500).send({ error: "Failed to update Auth0 ID" });
    }
  });

  // Get or create user from Auth0 profile
  fastify.post("/profile", async (request, reply) => {
    try {
      const { auth0Id, email, name, avatar } = request.body;
      console.log("Profile data:", { auth0Id, email, name, avatar });

      let user = await prisma.user.findUnique({
        where: { email },
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
          where: { email },
          data: {
            email,
            auth0Id,
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

  fastify.get("/search", async (request, reply) => {
    try {
      const { q } = request.query;

      if (!q || q.length < 2) {
        return { users: [] };
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              email: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
        },
        take: 10, // Limit results
      });

      return { users };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to search users" });
    }
  });

  // Get all users (for admin purposes)
  fastify.get("/users", async (request, reply) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return { users };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch users" });
    }
  });

  // Get user by ID
  fastify.get("/users/:userId", async (request, reply) => {
    try {
      const { userId } = request.params;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          role: true,
          createdAt: true,
        },
      });

      if (!user) {
        reply.status(404).send({ error: "User not found" });
        return;
      }

      return { user };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ error: "Failed to fetch user" });
    }
  });
};

export default authRoutes;
