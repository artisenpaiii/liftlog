import { eq } from "drizzle-orm";
import { db } from "../config/index.js";
import { programsTable } from "../db/schema.js";

export const programService = {
  async new(name: string, creator: string) {
    const [program] = await db
      .insert(programsTable)
      .values({
        name,
        createdBy: creator,
      })
      .returning();

    return program;
  },

  async getAll(userId: string) {
    return db.select().from(programsTable).where(eq(programsTable.createdBy, userId));
  },
};
