import Fastify from "fastify";
import { env } from "./config/index.js";
import { corsPlugin, jwtPlugin } from "./plugins/index.js";
import { authRoutes } from "./routes/index.js";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

const app = Fastify({
  logger: {
    level: env.isDev ? "info" : "warn",
    transport: env.isDev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
  },
  disableRequestLogging: true,
});

// Custom request logging that skips health checks (preHandler so body is parsed)
app.addHook("preHandler", (request, reply, done) => {
  if (request.url !== "/health") {
    request.log.info({ url: request.url, method: request.method, body: request.body, user: request.user }, "incoming request");
  }
  done();
});

// Log response
app.addHook("onSend", (request, reply, payload, done) => {
  if (request.url !== "/health") {
    request.log.info({ statusCode: reply.statusCode, response: payload }, "response");
  }
  done();
});

// Health check endpoint (no logging)
app.get("/health", async () => ({ status: "ok" }));

// Register plugins
await app.register(corsPlugin);
await app.register(jwtPlugin);

// Register routes
await app.register(authRoutes, { prefix: "/api/auth" });

// Start server
const start = async () => {
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`Server running at http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
