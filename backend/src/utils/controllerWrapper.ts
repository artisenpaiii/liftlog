import { FastifyRequest, FastifyReply } from "fastify";
import { LiftError } from "./exceptions.js";
import { HTTP_CODE } from "./constants.js";

type ControllerFn<T extends FastifyRequest = FastifyRequest> = (
  request: T,
  reply: FastifyReply
) => Promise<void>;

export function controllerWrapper<T extends FastifyRequest = FastifyRequest>(
  fn: ControllerFn<T>,
  fallbackMessage = "Internal server error"
) {
  return async (request: T, reply: FastifyReply) => {
    try {
      await fn(request, reply);
    } catch (error) {
      if (error instanceof LiftError) {
        return reply.status(error.code).send({ error: error.message, key: error.key });
      }
      return reply.status(HTTP_CODE.INTERNAL_SERVER_ERROR).send({ error: fallbackMessage });
    }
  };
}
