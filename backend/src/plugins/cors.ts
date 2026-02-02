import cors from "@fastify/cors";
import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { env } from "../config/index.js";

async function corsPluginCallback(app: FastifyInstance) {
  await app.register(cors, {
    origin: env.isDev ? ["http://localhost:3000"] : ["http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });
}

export const corsPlugin = fp(corsPluginCallback);
