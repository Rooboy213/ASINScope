import { Router, type IRouter } from "express";
import { db, contactSubmissionsTable, newsletterSubscribersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { SubmitContactBody, SubscribeNewsletterBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/contact", async (req, res): Promise<void> => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  await db.insert(contactSubmissionsTable).values({
    name: d.name,
    email: d.email,
    phone: d.phone ?? null,
    company: d.company ?? null,
    service: d.service ?? null,
    budget: d.budget ?? null,
    message: d.message,
  });
  res.status(201).json({ message: "Thank you! We'll be in touch within 24 hours." });
});

router.post("/newsletter/subscribe", async (req, res): Promise<void> => {
  const parsed = SubscribeNewsletterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, name } = parsed.data;
  const existing = await db.select().from(newsletterSubscribersTable).where(eq(newsletterSubscribersTable.email, email));
  if (existing.length > 0) {
    res.status(201).json({ message: "You are already subscribed." });
    return;
  }
  await db.insert(newsletterSubscribersTable).values({ email, name: name ?? null });
  res.status(201).json({ message: "Subscribed successfully! Welcome to NumVerify Insights." });
});

export default router;
