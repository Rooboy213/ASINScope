import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const testimonialsTable = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  clientName: text("client_name").notNull(),
  clientTitle: text("client_title").notNull(),
  company: text("company").notNull(),
  avatarUrl: text("avatar_url"),
  logoUrl: text("logo_url"),
  rating: integer("rating").notNull().default(5),
  text: text("text").notNull(),
  metrics: text("metrics"),
  featured: boolean("featured").notNull().default(false),
});

export const insertTestimonialSchema = createInsertSchema(testimonialsTable).omit({ id: true });
export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonialsTable.$inferSelect;
