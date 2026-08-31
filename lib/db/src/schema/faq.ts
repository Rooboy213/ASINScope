import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const faqTable = pgTable("faq", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const insertFaqSchema = createInsertSchema(faqTable).omit({ id: true });
export type InsertFaq = z.infer<typeof insertFaqSchema>;
export type FaqItem = typeof faqTable.$inferSelect;
