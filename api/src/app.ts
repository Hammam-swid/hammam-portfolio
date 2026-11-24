import express from "express";
import cors from "cors";
import helmet from "helmet";
import { config } from "./config";
import { errorHandler, notFound } from "./lib/http";
import { authRouter } from "./routes/auth";
import { experiencesRouter, projectsRouter, skillsRouter } from "./routes/resources";
import { uploadsRouter } from "./routes/uploads";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1); // behind cPanel's Apache/Passenger proxy

  // Media is embedded by the portfolio from another (sub)domain.
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: config.corsOrigins.length ? config.corsOrigins : false,
      maxAge: 86400,
    }),
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/skills", skillsRouter);
  app.use("/api/experiences", experiencesRouter);
  app.use("/api/uploads", uploadsRouter);
  app.use("/uploads", express.static(config.uploadDir, { maxAge: "30d", index: false }));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
