import { Router, type IRouter } from "express";
import { db, projectsTable, ordersTable, invoicesTable, ticketsTable, messagesTable, reportsTable, usersTable, newsletterSubscribersTable, contactSubmissionsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import {
  CreateTicketBody,
  UploadReportBody,
  ReplyToTicketBody,
  ReplyToTicketParams,
  UpdateOrderStatusBody,
  UpdateOrderStatusParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function getCurrentUserId(req: import("express").Request): number | null {
  const uid = req.cookies?.session_uid;
  const authHeader = req.headers.authorization;
  if (uid) return parseInt(uid, 10);
  if (authHeader?.startsWith("Bearer mock-token-")) {
    return parseInt(authHeader.replace("Bearer mock-token-", ""), 10);
  }
  return null;
}

// ─── Client Dashboard ────────────────────────────────────────────

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }

  const projects = await db.select().from(projectsTable).where(and(eq(projectsTable.clientId, userId), eq(projectsTable.status, "active")));
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.clientId, userId));
  const invoices = await db.select().from(invoicesTable).where(eq(invoicesTable.clientId, userId));
  const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.clientId, userId));

  const pendingOrders = orders.filter(o => o.status === "pending" || o.status === "in_progress").length;
  const unpaidInvoices = invoices.filter(i => i.status === "sent" || i.status === "overdue").length;
  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;
  const totalSpend = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + parseFloat(String(i.amount)), 0);

  res.json({
    activeProjects: projects.length,
    pendingOrders,
    unpaidInvoices,
    openTickets,
    totalSpend,
    revenueGrowth: 34.5,
    keywordRankings: 127,
    organicSalesGrowth: 42.8,
  });
});

router.get("/dashboard/projects", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const projects = await db.select().from(projectsTable).where(eq(projectsTable.clientId, userId));
  res.json(projects.map(p => ({
    id: p.id,
    title: p.title,
    status: p.status,
    progress: p.progress,
    serviceType: p.serviceType,
    startDate: p.startDate.toISOString(),
    dueDate: p.dueDate?.toISOString() ?? null,
    managerName: p.managerName,
    description: p.description,
  })));
});

router.get("/dashboard/orders", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.clientId, userId));
  res.json(orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    serviceName: o.serviceName,
    status: o.status,
    amount: parseFloat(String(o.amount)),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    completedAt: o.completedAt?.toISOString() ?? null,
    clientId: o.clientId,
    clientName: null,
  })));
});

router.get("/dashboard/invoices", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const invoices = await db.select().from(invoicesTable).where(eq(invoicesTable.clientId, userId));
  res.json(invoices.map(i => ({
    id: i.id,
    invoiceNumber: i.invoiceNumber,
    amount: parseFloat(String(i.amount)),
    currency: i.currency,
    status: i.status,
    dueDate: i.dueDate.toISOString(),
    paidAt: i.paidAt?.toISOString() ?? null,
    serviceName: i.serviceName,
    pdfUrl: i.pdfUrl ?? null,
    createdAt: i.createdAt.toISOString(),
  })));
});

router.get("/dashboard/tickets", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const tickets = await db.select().from(ticketsTable).where(eq(ticketsTable.clientId, userId));
  res.json(tickets.map(t => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    category: t.category,
    lastMessage: t.lastMessage,
    unreadCount: t.unreadCount,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    clientId: t.clientId ?? null,
    clientName: null,
  })));
});

router.post("/dashboard/tickets", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const parsed = CreateTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const [ticket] = await db.insert(ticketsTable).values({
    subject: d.subject,
    category: d.category,
    priority: d.priority as "low" | "medium" | "high" | "urgent",
    lastMessage: d.message,
    clientId: userId,
    unreadCount: 1,
  }).returning();
  res.status(201).json({
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    lastMessage: ticket.lastMessage,
    unreadCount: ticket.unreadCount,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    clientId: ticket.clientId ?? null,
    clientName: null,
  });
});

router.get("/dashboard/messages", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const messages = await db.select().from(messagesTable).where(eq(messagesTable.clientId, userId));
  res.json(messages.map(m => ({
    id: m.id,
    senderName: m.senderName,
    senderAvatarUrl: m.senderAvatarUrl ?? null,
    subject: m.subject,
    preview: m.preview,
    read: m.read,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.get("/dashboard/reports", async (req, res): Promise<void> => {
  const userId = getCurrentUserId(req);
  if (!userId) { res.status(401).json({ error: "Not authenticated" }); return; }
  const reports = await db.select().from(reportsTable).where(eq(reportsTable.clientId, userId));
  res.json(reports.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    fileUrl: r.fileUrl ?? null,
    reportType: r.reportType,
    period: r.period,
    clientId: r.clientId ?? null,
    createdAt: r.createdAt.toISOString(),
  })));
});

// ─── Admin Panel ─────────────────────────────────────────────────

router.get("/admin/stats", async (req, res): Promise<void> => {
  const clients = await db.select().from(usersTable).where(eq(usersTable.role, "client"));
  const projects = await db.select().from(projectsTable).where(eq(projectsTable.status, "active"));
  const tickets = await db.select().from(ticketsTable);
  const orders = await db.select().from(ordersTable);
  const invoices = await db.select().from(invoicesTable);
  const posts = await db.select({ id: reportsTable.id }).from(reportsTable);

  const totalRevenue = invoices.filter(i => i.status === "paid").reduce((sum, i) => sum + parseFloat(String(i.amount)), 0);
  const revenueThisMonth = totalRevenue * 0.12;
  const openTickets = tickets.filter(t => t.status === "open" || t.status === "in_progress").length;

  res.json({
    totalClients: clients.length,
    totalRevenue,
    activeProjects: projects.length,
    openTickets,
    newClientsThisMonth: Math.max(1, Math.round(clients.length * 0.15)),
    revenueThisMonth,
    avgProjectCompletion: 72,
    totalBlogPosts: posts.length,
  });
});

router.get("/admin/clients", async (req, res): Promise<void> => {
  const users = await db.select().from(usersTable).where(eq(usersTable.role, "client"));
  res.json(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    company: u.company ?? null,
    avatarUrl: u.avatarUrl ?? null,
    createdAt: u.createdAt.toISOString(),
  })));
});

router.get("/admin/orders", async (req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable);
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u.name]));
  res.json(orders.map(o => ({
    id: o.id,
    orderNumber: o.orderNumber,
    serviceName: o.serviceName,
    status: o.status,
    amount: parseFloat(String(o.amount)),
    currency: o.currency,
    createdAt: o.createdAt.toISOString(),
    completedAt: o.completedAt?.toISOString() ?? null,
    clientId: o.clientId,
    clientName: userMap.get(o.clientId) ?? null,
  })));
});

router.patch("/admin/orders/:id/status", async (req, res): Promise<void> => {
  const params = UpdateOrderStatusParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = UpdateOrderStatusBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [order] = await db.update(ordersTable)
    .set({ status: parsed.data.status as "pending" | "in_progress" | "review" | "completed" | "cancelled" })
    .where(eq(ordersTable.id, params.data.id))
    .returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json({
    id: order.id,
    orderNumber: order.orderNumber,
    serviceName: order.serviceName,
    status: order.status,
    amount: parseFloat(String(order.amount)),
    currency: order.currency,
    createdAt: order.createdAt.toISOString(),
    completedAt: order.completedAt?.toISOString() ?? null,
    clientId: order.clientId,
    clientName: null,
  });
});

router.get("/admin/tickets", async (req, res): Promise<void> => {
  const tickets = await db.select().from(ticketsTable);
  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u.name]));
  res.json(tickets.map(t => ({
    id: t.id,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    category: t.category,
    lastMessage: t.lastMessage,
    unreadCount: t.unreadCount,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    clientId: t.clientId ?? null,
    clientName: t.clientId ? (userMap.get(t.clientId) ?? null) : null,
  })));
});

router.post("/admin/tickets/:id/reply", async (req, res): Promise<void> => {
  const params = ReplyToTicketParams.safeParse(req.params);
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }
  const parsed = ReplyToTicketBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const updates: Record<string, unknown> = { lastMessage: parsed.data.message, unreadCount: 1 };
  if (parsed.data.status) updates.status = parsed.data.status;
  const [ticket] = await db.update(ticketsTable).set(updates).where(eq(ticketsTable.id, params.data.id)).returning();
  if (!ticket) { res.status(404).json({ error: "Ticket not found" }); return; }
  res.json({
    id: ticket.id,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    lastMessage: ticket.lastMessage,
    unreadCount: ticket.unreadCount,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    clientId: ticket.clientId ?? null,
    clientName: null,
  });
});

router.post("/admin/reports", async (req, res): Promise<void> => {
  const parsed = UploadReportBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const d = parsed.data;
  const [report] = await db.insert(reportsTable).values({
    title: d.title,
    description: d.description,
    fileUrl: d.fileUrl ?? null,
    reportType: d.reportType,
    period: d.period,
    clientId: d.clientId,
  }).returning();
  res.status(201).json({
    id: report.id,
    title: report.title,
    description: report.description,
    fileUrl: report.fileUrl ?? null,
    reportType: report.reportType,
    period: report.period,
    clientId: report.clientId ?? null,
    createdAt: report.createdAt.toISOString(),
  });
});

router.get("/admin/contacts", async (req, res): Promise<void> => {
  const contacts = await db.select().from(contactSubmissionsTable);
  res.json(contacts.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone ?? null,
    company: c.company ?? null,
    service: c.service ?? null,
    budget: c.budget ?? null,
    message: c.message,
    read: c.read,
    createdAt: c.createdAt.toISOString(),
  })));
});

router.get("/admin/newsletter-subscribers", async (req, res): Promise<void> => {
  const subscribers = await db.select().from(newsletterSubscribersTable);
  res.json(subscribers.map(s => ({
    id: s.id,
    email: s.email,
    name: s.name ?? null,
    subscribedAt: s.subscribedAt.toISOString(),
  })));
});

export default router;
