import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db } from "../config/index.js";
import { usersTable } from "../db/schema.js";
import { RegisterBody, LoginBody } from "../types/index.js";
import { LiftError, HTTP_CODE } from "../utils/index.js";

const SALT_ROUNDS = 10;

export const authService = {
  async register(data: RegisterBody) {
    const existingEmail = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));

    if (existingEmail.length > 0) {
      throw new LiftError("Email already registered", HTTP_CODE.BAD_REQUEST, "email");
    }

    const existingUsername = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.username, data.username));

    if (existingUsername.length > 0) {
      throw new LiftError("Username already taken", HTTP_CODE.BAD_REQUEST, "username");
    }

    const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);

    const [user] = await db
      .insert(usersTable)
      .values({
        username: data.username,
        email: data.email,
        password: hashedPassword,
      })
      .returning();

    return user;
  },

  async login(data: LoginBody) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, data.email));

    if (!user) {
      throw new LiftError("Invalid credentials", HTTP_CODE.UNAUTHORIZED);
    }

    const validPassword = await bcrypt.compare(data.password, user.password);

    if (!validPassword) {
      throw new LiftError("Invalid credentials", HTTP_CODE.UNAUTHORIZED);
    }

    return user;
  },

  async getProfile(userId: string) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId));

    if (!user) {
      throw new LiftError("User not found", HTTP_CODE.NOT_FOUND);
    }

    return user;
  },
};
