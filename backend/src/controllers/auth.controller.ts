import { FastifyRequest, FastifyReply } from "fastify";
import { authService } from "../services/index.js";
import { RegisterBody, LoginBody } from "../types/index.js";
import { HTTP_CODE } from "../utils/index.js";

export const authController = {
  async register(request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply) {
    const user = await authService.register(request.body);
    const token = await reply.jwtSign({ id: user.id });

    return reply.status(HTTP_CODE.CREATED).send({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  },

  async login(request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) {
    const user = await authService.login(request.body);
    const token = await reply.jwtSign({ id: user.id });

    return reply.status(HTTP_CODE.OK).send({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      token,
    });
  },

  async profile(request: FastifyRequest, reply: FastifyReply) {
    const user = await authService.getProfile(request.user.id);

    return reply.status(HTTP_CODE.OK).send({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  },
};
