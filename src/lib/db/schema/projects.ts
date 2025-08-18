import { sql } from "drizzle-orm";
import { pgTable, uuid, text, varchar, timestamp, jsonb, integer, date, decimal } from "drizzle-orm/pg-core";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  
  // Project information
  title: text("title").notNull(),
  name: text("name"),
  description: text("description"),
  status: varchar("status", { length: 50 })
    .notNull()
    .default("not_started")
    .$type<"active" | "completed" | "on_hold" | "cancelled" | "not_started">(),
  priority: varchar("priority", { length: 20 })
    .notNull()
    .default("medium")
    .$type<"high" | "medium" | "low">(),
  
  // Dates
  startDate: date("start_date"),
  dueDate: date("due_date"),
  
  // Financial
  budget: decimal("budget", { precision: 10, scale: 2 }),
  
  // Progress tracking
  progress: integer("progress").default(0),
  
  // Metadata - stores all flexible fields
  metadata: jsonb("metadata").$type<{
    client_name?: string;
    team_members?: string[];
    tags?: string[];
    [key: string]: any;
  }>().default({}),
});

// Create Zod schemas for validation
export const selectProjectSchema = createSelectSchema(projects);
export const insertProjectSchema = createInsertSchema(projects, {
  title: z.string().min(1, "Title is required"),
  status: z.enum(["active", "completed", "on_hold", "cancelled", "not_started"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  progress: z.number().min(0).max(100).optional(),
});

// Type exports
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type ProjectInsert = z.infer<typeof insertProjectSchema>;