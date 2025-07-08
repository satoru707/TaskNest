import fastifyPlugin from "fastify-plugin";

async function socketPlugin(fastify, options) {}

export default fastifyPlugin(socketPlugin, {
  name: "socket-plugin",
  dependencies: ["fastify-socket.io"],
});
