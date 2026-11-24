import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { config } from "../config";
import { HttpError } from "./http";

export const UPLOADS_PREFIX = "/uploads/";

const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

/** Only lowercase letters, digits, dashes and single slashes — e.g. "projects". */
export function safeFolder(folder: unknown): string {
  const f = typeof folder === "string" ? folder.toLowerCase() : "";
  if (!f) return "misc";
  if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(f)) throw new HttpError(400, "Invalid folder");
  return f;
}

function slug(name: string): string {
  return (
    path
      .parse(name)
      .name.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "file"
  );
}

export const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      try {
        const dir = path.join(config.uploadDir, safeFolder(req.query.folder));
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      } catch (e) {
        cb(e as Error, "");
      }
    },
    filename: (_req, file, cb) => {
      const id = crypto.randomBytes(6).toString("hex");
      cb(null, `${slug(file.originalname)}-${id}${ALLOWED[file.mimetype]}`);
    },
  }),
  limits: { fileSize: config.maxUploadMb * 1024 * 1024, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED[file.mimetype]) cb(null, true);
    else cb(new HttpError(400, `Unsupported file type: ${file.mimetype}`));
  },
});

/** Public path (e.g. /uploads/projects/x.png) for a file multer saved. */
export function publicPath(absFile: string): string {
  return UPLOADS_PREFIX + path.relative(config.uploadDir, absFile).split(path.sep).join("/");
}

/** Resolves a public /uploads/... path to a file inside UPLOAD_DIR, or null if it points elsewhere. */
export function resolveUpload(publicSrc: string): string | null {
  if (!publicSrc.startsWith(UPLOADS_PREFIX)) return null;
  const rel = decodeURIComponent(publicSrc.slice(UPLOADS_PREFIX.length));
  const abs = path.resolve(config.uploadDir, rel);
  const root = config.uploadDir + path.sep;
  return abs.startsWith(root) ? abs : null;
}

/** Best-effort removal of uploaded files that are no longer referenced. */
export async function removeUploads(srcs: Iterable<string>): Promise<void> {
  await Promise.all(
    [...new Set(srcs)].map(async (src) => {
      const abs = resolveUpload(src);
      if (abs) await fs.promises.rm(abs, { force: true }).catch(() => {});
    }),
  );
}
