import { FastifyInstance } from "fastify";
import { authController } from "../controllers/index.js";
import { VALIDATION, controllerWrapper } from "../utils/index.js";

const registerSchema = {
  body: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: {
        type: "string",
        minLength: VALIDATION.USERNAME.MIN,
        maxLength: VALIDATION.USERNAME.MAX,
      },
      email: {
        type: "string",
        format: "email",
        maxLength: VALIDATION.EMAIL.MAX,
      },
      password: {
        type: "string",
        minLength: VALIDATION.PASSWORD.MIN,
        maxLength: VALIDATION.PASSWORD.MAX,
      },
    },
  },
};

const loginSchema = {
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email" },
      password: { type: "string" },
    },
  },
};

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", { schema: registerSchema }, controllerWrapper(authController.register, "Registration failed"));
  app.post("/login", { schema: loginSchema }, controllerWrapper(authController.login, "Login failed"));
  app.get("/profile", { preHandler: [app.authenticate] }, controllerWrapper(authController.profile, "Failed to get profile"));
}
