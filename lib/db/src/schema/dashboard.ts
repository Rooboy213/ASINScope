import { pgTable, text, serial, boolean, integer, timestamp, numeric, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectStatusEnum = pgEnum("project_status", ["active", "completed", "paused", "cancelled"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "in_progress", "review", "completed", "cancelled"]);
export const invoiceStatusEnum = pgEnum("invoice_status", ["draft", "sent", "paid", "overdue", "cancelled"]);
export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "waiting", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  status: projectStatusEnum("status").notNull().default("active"),
  progress: integer("progress").notNull().default(0),
  serviceType: text("service_type").notNull(),
  startDate: timestamp("start_date", { withTimezone: true }).notNull().defaultNow(),
  dueDate: timestamp("due_date", { withTimezone: true }),
  managerName: text("manager_name").notNull(),
  description: text("description").notNull(),
  clientId: integer("client_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  serviceName: text("service_name").notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  clientId: integer("client_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("USD"),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  dueDate: timestamp("due_date", { withTimezone: true }).notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  serviceName: text("service_name").notNull(),
  pdfUrl: text("pdf_url"),
  clientId: integer("client_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  status: ticketStatusEnum("status").notNull().default("open"),
  priority: ticketPriorityEnum("priority").notNull().default("medium"),
  category: text("category").notNull(),
  lastMessage: text("last_message").notNull(),
  unreadCount: integer("unread_count").notNull().default(0),
  clientId: integer("client_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const messagesTable = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  senderAvatarUrl: text("sender_avatar_url"),
  subject: text("subject").notNull(),
  preview: text("preview").notNull(),
  read: boolean("read").notNull().default(false),
  clientId: integer("client_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  fileUrl: text("file_url"),
  reportType: text("report_type").notNull(),
  period: text("period").notNull(),
  clientId: integer("client_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true });
export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true });
export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, createdAt: true });
export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMessageSchema = createInsertSchema(messagesTable).omit({ id: true, createdAt: true });
export const insertReportSchema = createInsertSchema(reportsTable).omit({ id: true, createdAt: true });

export type Project = typeof projectsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type Invoice = typeof invoicesTable.$inferSelect;
export type Ticket = typeof ticketsTable.$inferSelect;
export type Message = typeof messagesTable.$inferSelect;
export type Report = typeof reportsTable.$inferSelect;
