import jwt from "@fastify/jwt";
import cookie from "@fastify/cookie";
import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { env } from "../config/index.js";

async function jwtPluginCallback(app: FastifyInstance) {
  await app.register(cookie);

  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
    cookie: {
      cookieName: "token",
      signed: false,
    },
  });

  // Decorator to authenticate requests
  app.decorate(
    "authenticate",
    async function (request: FastifyRequest, reply: FastifyReply) {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: "Unauthorized" });
      }
    }
  );
}

// Wrap with fastify-plugin to share decorator across all routes
export const jwtPlugin = fp(jwtPluginCallback);

// Type augmentation for Fastify
declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { id: string };
    user: { id: string };
  }
}
