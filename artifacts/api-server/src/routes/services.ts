import { Router, type IRouter } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetServiceParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/services", async (req, res): Promise<void> => {
  const services = await db.select().from(servicesTable).orderBy(servicesTable.sortOrder);
  res.json(services.map(s => ({
    id: s.id,
    title: s.title,
    description: s.description,
    icon: s.icon,
    category: s.category,
    featured: s.featured,
    sortOrder: s.sortOrder,
  })));
});

router.get("/services/:id", async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, params.data.id));
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }
  res.json({
    id: service.id,
    title: service.title,
    description: service.description,
    icon: service.icon,
    category: service.category,
    featured: service.featured,
    sortOrder: service.sortOrder,
  });
});

export default router;
