import { Router, type IRouter } from "express";
import { db, testimonialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTestimonialBody, DeleteTestimonialParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/testimonials", async (req, res): Promise<void> => {
  const testimonials = await db.select().from(testimonialsTable);
  res.json(testimonials.map(t => ({
    id: t.id,
    clientName: t.clientName,
    clientTitle: t.clientTitle,
    company: t.company,
    avatarUrl: t.avatarUrl ?? null,
    logoUrl: t.logoUrl ?? null,
    rating: t.rating,
    text: t.text,
    metrics: t.metrics ?? null,
    featured: t.featured,
  })));
});

router.post("/testimonials", async (req, res): Promise<void> => {
  const parsed = CreateTestimonialBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const d = parsed.data;
  const [t] = await db.insert(testimonialsTable).values({
    clientName: d.clientName,
    clientTitle: d.clientTitle,
    company: d.company,
    avatarUrl: d.avatarUrl ?? null,
    logoUrl: d.logoUrl ?? null,
    rating: d.rating ?? 5,
    text: d.text,
    metrics: d.metrics ?? null,
    featured: d.featured ?? false,
  }).returning();
  res.status(201).json({
    id: t.id,
    clientName: t.clientName,
    clientTitle: t.clientTitle,
    company: t.company,
    avatarUrl: t.avatarUrl ?? null,
    logoUrl: t.logoUrl ?? null,
    rating: t.rating,
    text: t.text,
    metrics: t.metrics ?? null,
    featured: t.featured,
  });
});

router.delete("/testimonials/:id", async (req, res): Promise<void> => {
  const params = DeleteTestimonialParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(testimonialsTable).where(eq(testimonialsTable.id, params.data.id));
  res.json({ message: "Testimonial deleted" });
});

export default router;
