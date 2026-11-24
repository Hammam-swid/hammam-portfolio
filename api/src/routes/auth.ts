import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../config";
import { requireAuth, signToken } from "../lib/auth";
import { HttpError } from "../lib/http";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later" },
});

const loginSchema = z.object({ username: z.string(), password: z.string() });

authRouter.post("/login", loginLimiter, async (req, res) => {
  const { username, password } = loginSchema.parse(req.body);
  const ok =
    username === config.adminUsername &&
    (await bcrypt.compare(password, config.adminPasswordHash));
  if (!ok) throw new HttpError(401, "Wrong username or password");
  res.json({ token: signToken(username), username });
});

authRouter.get("/me", requireAuth, (_req, res) => {
  res.json({ username: res.locals.user });
});
