import "dotenv/config";
import axios from "axios";
import { WebAuth } from "auth0-js";

//it has redirect url so I don't have to do anything on the front end
const webAuth = new WebAuth({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  redirectUri: `${process.env.SOCKET_CORS_ORIGIN}/dashboard`,
  responseType: "token id_token",
  scope: "openid profile email",
});

const authRoutes = async (fastify) => {
  const prisma = fastify.prisma;

  fastify.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.code(400).send({ error: "Email and password are required" });
      }
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { auth0Id: true, name: true, password: true },
      });
      if (!existingUser) {
        console.log("User does not exiss");
        return res.send({ error: "User doesn't exists!" });
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
        select: { auth0Id: true, name: true },
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

  // fastify.post("");

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
