import { Router, type IRouter } from "express";
import { db, pricingPlansTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/pricing/plans", async (req, res): Promise<void> => {
  const plans = await db.select().from(pricingPlansTable).orderBy(pricingPlansTable.id);
  res.json(plans.map(p => ({
    id: p.id,
    name: p.name,
    price: parseFloat(String(p.price)),
    billingCycle: p.billingCycle,
    description: p.description,
    features: p.features ?? [],
    highlighted: p.highlighted,
    ctaLabel: p.ctaLabel,
    badge: p.badge ?? null,
  })));
});

export default router;
