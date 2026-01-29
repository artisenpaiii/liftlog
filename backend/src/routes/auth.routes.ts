import { FastifyInstance } from "fastify";
import { authController } from "../controllers/index.js";

// JSON Schema for request validation
const registerSchema = {
  body: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: { type: "string", minLength: 3, maxLength: 30 },
      email: { type: "string", format: "email" },
      password: { type: "string", minLength: 8 },
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
  // POST /api/auth/register
  app.post("/register", { schema: registerSchema }, authController.register);

  // POST /api/auth/login
  app.post("/login", { schema: loginSchema }, authController.login);

  // GET /api/auth/profile (protected)
  app.get(
    "/profile",
    { preHandler: [app.authenticate] },
    authController.profile
  );
}
