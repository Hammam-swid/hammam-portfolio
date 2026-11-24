import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

function required(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  isProd: process.env.NODE_ENV === "production",
  corsOrigins: (process.env.CORS_ORIGINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    name: process.env.DB_NAME ?? "portfolio",
  },
  get jwtSecret() {
    return required("JWT_SECRET");
  },
  adminUsername: process.env.ADMIN_USERNAME ?? "admin",
  get adminPasswordHash() {
    return required("ADMIN_PASSWORD_HASH");
  },
  uploadDir: path.resolve(process.env.UPLOAD_DIR ?? "uploads"),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 100),
};
