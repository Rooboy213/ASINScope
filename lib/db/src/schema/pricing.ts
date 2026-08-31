import { pgTable, text, serial, boolean, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pricingPlansTable = pgTable("pricing_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  description: text("description").notNull(),
  features: text("features").array().notNull().default([]),
  highlighted: boolean("highlighted").notNull().default(false),
  ctaLabel: text("cta_label").notNull().default("Get Started"),
  badge: text("badge"),
});

export const insertPricingPlanSchema = createInsertSchema(pricingPlansTable).omit({ id: true });
export type InsertPricingPlan = z.infer<typeof insertPricingPlanSchema>;
export type PricingPlan = typeof pricingPlansTable.$inferSelect;
