import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function health(_req: unknown, res: { json: (body: unknown) => void }) {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
}

// Render health check + existing path
router.get("/health", health);
router.get("/healthz", health);

export default router;
