import { FastifyRequest, FastifyReply } from "fastify";
import { authService, ValidationError } from "../services/index.js";
import { RegisterBody, LoginBody } from "../types/index.js";

export const authController = {
  async register(
    request: FastifyRequest<{ Body: RegisterBody }>,
    reply: FastifyReply
  ) {
    try {
      const user = await authService.register(request.body);
      const token = await reply.jwtSign({ id: user.id, email: user.email });

      return reply.status(201).send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      request.log.error(error);
      if (error instanceof ValidationError) {
        return reply.status(400).send({ error: error.message, field: error.field });
      }
      return reply.status(400).send({ error: "Registration failed" });
    }
  },

  async login(
    request: FastifyRequest<{ Body: LoginBody }>,
    reply: FastifyReply
  ) {
    try {
      const user = await authService.login(request.body);
      const token = await reply.jwtSign({ id: user.id, email: user.email });

      return reply.send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(401).send({ error: "Invalid credentials" });
    }
  },

  async profile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await authService.getProfile(request.user.id);

      return reply.send({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error) {
      request.log.error(error);
      return reply.status(404).send({ error: "User not found" });
    }
  },
};
