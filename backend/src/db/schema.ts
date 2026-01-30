import { pgTable, uuid, varchar, timestamp, integer, text, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { VALIDATION } from "../utils/index.js";

// ============ TABLES ============

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: VALIDATION.USERNAME.MAX }).unique().notNull(),
  email: varchar("email", { length: VALIDATION.EMAIL.MAX }).unique().notNull(),
  password: varchar("password", { length: VALIDATION.PASSWORD.MAX }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const programsTable = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: VALIDATION.PROGRAM_NAME.MAX }).notNull(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => usersTable.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const blocksTable = pgTable("blocks", {
  id: uuid("id").primaryKey().defaultRandom(),
  programId: uuid("program_id")
    .notNull()
    .references(() => programsTable.id),
  name: varchar("name", { length: VALIDATION.BLOCK_NAME.MAX }).notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const weeksTable = pgTable("weeks", {
  id: uuid("id").primaryKey().defaultRandom(),
  blockId: uuid("block_id")
    .notNull()
    .references(() => blocksTable.id),
  weekNumber: integer("week_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const daysTable = pgTable("days", {
  id: uuid("id").primaryKey().defaultRandom(),
  weekId: uuid("week_id")
    .notNull()
    .references(() => weeksTable.id),
  dayNumber: integer("day_number").notNull(),
  name: varchar("name", { length: VALIDATION.DAY_NAME.MAX }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const exercisesTable = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: VALIDATION.EXERCISE_NAME.MAX }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dayExercisesTable = pgTable("day_exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  dayId: uuid("day_id")
    .notNull()
    .references(() => daysTable.id),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercisesTable.id),
  order: integer("order").notNull().default(0),
  sets: integer("sets"),
  reps: varchar("reps", { length: VALIDATION.REPS.MAX }),
  weight: varchar("weight", { length: VALIDATION.WEIGHT.MAX }),
  rpe: varchar("rpe", { length: VALIDATION.RPE.MAX }),
  notes: text("notes"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============ RELATIONS ============

export const usersRelations = relations(usersTable, ({ many }) => ({
  programs: many(programsTable),
}));

export const programsRelations = relations(programsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [programsTable.createdBy],
    references: [usersTable.id],
  }),
  blocks: many(blocksTable),
}));

export const blocksRelations = relations(blocksTable, ({ one, many }) => ({
  program: one(programsTable, {
    fields: [blocksTable.programId],
    references: [programsTable.id],
  }),
  weeks: many(weeksTable),
}));

export const weeksRelations = relations(weeksTable, ({ one, many }) => ({
  block: one(blocksTable, {
    fields: [weeksTable.blockId],
    references: [blocksTable.id],
  }),
  days: many(daysTable),
}));

export const daysRelations = relations(daysTable, ({ one, many }) => ({
  week: one(weeksTable, {
    fields: [daysTable.weekId],
    references: [weeksTable.id],
  }),
  dayExercises: many(dayExercisesTable),
}));

export const exercisesRelations = relations(exercisesTable, ({ many }) => ({
  dayExercises: many(dayExercisesTable),
}));

export const dayExercisesRelations = relations(dayExercisesTable, ({ one }) => ({
  day: one(daysTable, {
    fields: [dayExercisesTable.dayId],
    references: [daysTable.id],
  }),
  exercise: one(exercisesTable, {
    fields: [dayExercisesTable.exerciseId],
    references: [exercisesTable.id],
  }),
}));

// ============ TYPES ============

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;
export type Program = typeof programsTable.$inferSelect;
export type NewProgram = typeof programsTable.$inferInsert;
export type Block = typeof blocksTable.$inferSelect;
export type NewBlock = typeof blocksTable.$inferInsert;
export type Week = typeof weeksTable.$inferSelect;
export type NewWeek = typeof weeksTable.$inferInsert;
export type Day = typeof daysTable.$inferSelect;
export type NewDay = typeof daysTable.$inferInsert;
export type Exercise = typeof exercisesTable.$inferSelect;
export type NewExercise = typeof exercisesTable.$inferInsert;
export type DayExercise = typeof dayExercisesTable.$inferSelect;
export type NewDayExercise = typeof dayExercisesTable.$inferInsert;
