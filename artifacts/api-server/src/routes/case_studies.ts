import { Router, type IRouter } from "express";
import { db, caseStudiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetCaseStudyParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatCaseStudy(cs: typeof caseStudiesTable.$inferSelect) {
  return {
    id: cs.id,
    title: cs.title,
    clientName: cs.clientName,
    industry: cs.industry,
    challenge: cs.challenge,
    solution: cs.solution,
    results: cs.results,
    metrics: (cs.metrics as Array<{ label: string; before: string; after: string; improvement: string }>) ?? [],
    imageUrl: cs.imageUrl ?? null,
    timelineMonths: cs.timelineMonths,
    featured: cs.featured,
    createdAt: cs.createdAt.toISOString(),
  };
}

router.get("/case-studies", async (req, res): Promise<void> => {
  const studies = await db.select().from(caseStudiesTable);
  res.json(studies.map(formatCaseStudy));
});

router.get("/case-studies/:id", async (req, res): Promise<void> => {
  const params = GetCaseStudyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [cs] = await db.select().from(caseStudiesTable).where(eq(caseStudiesTable.id, params.data.id));
  if (!cs) {
    res.status(404).json({ error: "Case study not found" });
    return;
  }
  res.json(formatCaseStudy(cs));
});

export default router;
