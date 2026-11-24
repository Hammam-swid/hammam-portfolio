import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { HttpError } from "./http";

export interface TokenPayload {
  sub: string;
}

export function signToken(username: string): string {
  return jwt.sign({ sub: username } satisfies TokenPayload, config.jwtSecret, {
    expiresIn: "7d",
  });
}

/** Rejects the request with 401 unless it carries a valid `Bearer` token. */
export const requireAuth: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next(new HttpError(401, "Authentication required"));
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    res.locals.user = payload.sub;
    next();
  } catch {
    next(new HttpError(401, "Invalid or expired token"));
  }
};
