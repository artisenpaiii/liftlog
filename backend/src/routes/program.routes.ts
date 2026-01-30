import { FastifyInstance } from "fastify";
import { programController } from "../controllers/program.controller.js";
import { VALIDATION, controllerWrapper } from "../utils/index.js";
import { NewProgramBody } from "../types/program.js";

const newProgramSchema = {
  body: {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        minLength: VALIDATION.PROGRAM_NAME.MIN,
        maxLength: VALIDATION.PROGRAM_NAME.MAX,
      },
    },
  },
};

export async function programRoutes(app: FastifyInstance) {
  app.post<{ Body: NewProgramBody }>("/new", { schema: newProgramSchema, preHandler: [app.authenticate] }, controllerWrapper(programController.new, "Failed to create program"));
  app.get("/", { preHandler: [app.authenticate] }, controllerWrapper(programController.getAll, "Failed to get programs"));
}
