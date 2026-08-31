import { Router, type IRouter } from "express";
import { db, faqTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateFaqItemBody, UpdateFaqItemBody, UpdateFaqItemParams, DeleteFaqItemParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/faq", async (req, res): Promise<void> => {
  const items = await db.select().from(faqTable).orderBy(faqTable.sortOrder);
  res.json(items.map(f => ({
    id: f.id,
    question: f.question,
    answer: f.answer,
    category: f.category,
    sortOrder: f.sortOrder,
  })));
});

router.post("/faq", async (req, res): Promise<void> => {
  const parsed = CreateFaqItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const [item] = await db.insert(faqTable).values({
    question: d.question,
    answer: d.answer,
    category: d.category,
    sortOrder: d.sortOrder ?? 0,
  }).returning();
  res.status(201).json({ id: item.id, question: item.question, answer: item.answer, category: item.category, sortOrder: item.sortOrder });
});

router.patch("/faq/:id", async (req, res): Promise<void> => {
  const params = UpdateFaqItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateFaqItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const updates: Record<string, unknown> = {};
  const d = parsed.data;
  if (d.question !== undefined) updates.question = d.question;
  if (d.answer !== undefined) updates.answer = d.answer;
  if (d.category !== undefined) updates.category = d.category;
  if (d.sortOrder !== undefined) updates.sortOrder = d.sortOrder;
  const [item] = await db.update(faqTable).set(updates).where(eq(faqTable.id, params.data.id)).returning();
  if (!item) { res.status(404).json({ error: "FAQ item not found" }); return; }
  res.json({ id: item.id, question: item.question, answer: item.answer, category: item.category, sortOrder: item.sortOrder });
});

router.delete("/faq/:id", async (req, res): Promise<void> => {
  const params = DeleteFaqItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(faqTable).where(eq(faqTable.id, params.data.id));
  res.json({ message: "FAQ item deleted" });
});

export default router;
