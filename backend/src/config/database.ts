import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "./env.js";
import * as schema from "../db/schema.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Test connection on startup
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
