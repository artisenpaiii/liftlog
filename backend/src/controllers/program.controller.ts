import { FastifyRequest, FastifyReply } from "fastify";
import { programService } from "../services/program.service.js";
import { HTTP_CODE } from "../utils/index.js";
import { NewProgramBody } from "../types/program.js";

export const programController = {
  async new(request: FastifyRequest<{ Body: NewProgramBody }>, reply: FastifyReply) {
    const program = await programService.new(request.body.name, request.user.id);
    return reply.status(HTTP_CODE.CREATED).send({ id: program.id });
  },

  async getAll(request: FastifyRequest, reply: FastifyReply) {
    const programs = await programService.getAll(request.user.id);
    return reply.status(HTTP_CODE.OK).send({ programs });
  },
};
