import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

// Required behind Render / reverse proxies (correct IPs + secure cookies)
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the Vite frontend in production (single service on Render).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const candidates = [
  path.resolve(process.cwd(), "artifacts/numverify/dist/public"),
  path.resolve(__dirname, "../../numverify/dist/public"),
  path.resolve(__dirname, "../numverify/dist/public"),
];

const publicDir = candidates.find((dir) =>
  fs.existsSync(path.join(dir, "index.html")),
);

if (publicDir) {
  logger.info({ publicDir }, "Serving frontend static files");
  app.use(express.static(publicDir, { index: false }));

  // SPA fallback (do not intercept /api)
  app.get(/^(?!\/api).*/,
    (_req, res) => {
      res.sendFile(path.join(publicDir, "index.html"));
    },
  );
} else if (process.env.NODE_ENV === "production") {
  logger.warn("Frontend dist not found — API-only mode");
}

export default app;
