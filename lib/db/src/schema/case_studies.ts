import { pgTable, text, serial, boolean, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const caseStudiesTable = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  clientName: text("client_name").notNull(),
  industry: text("industry").notNull(),
  challenge: text("challenge").notNull(),
  solution: text("solution").notNull(),
  results: text("results").notNull(),
  metrics: jsonb("metrics").notNull().default([]),
  imageUrl: text("image_url"),
  timelineMonths: integer("timeline_months").notNull().default(3),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCaseStudySchema = createInsertSchema(caseStudiesTable).omit({ id: true, createdAt: true });
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;
export type CaseStudy = typeof caseStudiesTable.$inferSelect;
