import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../lib/auth";
import { HttpError } from "../lib/http";
import { publicPath, removeUploads, resolveUpload, upload } from "../lib/uploads";

export const uploadsRouter = Router();

/** POST /api/uploads?folder=projects  (multipart, field "files") -> [{ src, type, name, size }] */
uploadsRouter.post("/", requireAuth, upload.array("files"), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw new HttpError(400, "No files uploaded");
  res.status(201).json(
    files.map((f) => ({
      src: publicPath(f.path),
      type: f.mimetype.startsWith("video/") ? "video" : "image",
      name: f.originalname,
      size: f.size,
    })),
  );
});

/** DELETE /api/uploads  body: { src: "/uploads/..." } */
uploadsRouter.delete("/", requireAuth, async (req, res) => {
  const { src } = z.object({ src: z.string() }).parse(req.body);
  if (!resolveUpload(src)) throw new HttpError(400, "Not an uploaded file");
  await removeUploads([src]);
  res.status(204).end();
});
