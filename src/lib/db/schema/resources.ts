import { sql } from "drizzle-orm";
import { text, varchar, timestamp, pgTable } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { nanoid } from "nanoid";

export const resources = pgTable("resources", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  content: text("content").notNull(),
  title: varchar("title", { length: 255 }),
  url: text("url"),
  type: varchar("type", { length: 50 }).default("document"),

  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for resources - used to validate API requests
export const insertResourceSchema = createSelectSchema(resources)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for resources - used to type API request params and within Components
export type Resource = typeof resources.$inferSelect;
export type NewResourceParams = z.infer<typeof insertResourceSchema>;

// Suggestions table for document feedback
export const suggestions = pgTable("suggestions", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  documentId: varchar("document_id", { length: 191 }).notNull(),
  content: text("content").notNull(),
  type: varchar("type", { length: 50 }).default("feedback"),
  isApplied: varchar("is_applied", { length: 10 }).default("false"),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for suggestions
export const insertSuggestionSchema = createSelectSchema(suggestions)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for suggestions
export type Suggestion = typeof suggestions.$inferSelect;
export type NewSuggestionParams = z.infer<typeof insertSuggestionSchema>;

// Votes table for user feedback
export const votes = pgTable("votes", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  messageId: varchar("message_id", { length: 191 }).notNull(),
  isUpvote: varchar("is_upvote", { length: 10 }).notNull(),
  
  createdAt: timestamp("created_at")
    .notNull()
    .default(sql`now()`),
  updatedAt: timestamp("updated_at")
    .notNull()
    .default(sql`now()`),
});

// Schema for votes
export const insertVoteSchema = createSelectSchema(votes)
  .extend({})
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  });

// Type for votes
export type Vote = typeof votes.$inferSelect;
export type NewVoteParams = z.infer<typeof insertVoteSchema>;