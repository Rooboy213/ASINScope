import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/stats", async (req, res): Promise<void> => {
  res.json({
    productsSupported: 10000,
    brandsServed: 500,
    satisfactionRate: 98,
    revenueInfluencedMillions: 50,
    yearsExperience: 8,
    expertSpecialists: 45,
  });
});

export default router;
