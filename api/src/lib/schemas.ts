import { z } from "zod";
import { EXPERIENCE_KINDS, PROJECT_CATEGORIES } from "../types";

const localized = z.object({ en: z.string().trim(), ar: z.string().trim() });
const localizedRequired = z.object({
  en: z.string().trim().min(1, "Required"),
  ar: z.string().trim().min(1, "Required"),
});
const localizedList = z.object({
  en: z.array(z.string().trim().min(1)),
  ar: z.array(z.string().trim().min(1)),
});
const optionalUrl = z
  .union([z.url(), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v ? v : null));
const yearMonth = z
  .union([z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM"), z.literal(""), z.null()])
  .optional()
  .transform((v) => (v ? v : null));

export const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  src: z.string().trim().min(1),
  poster: z.string().trim().optional().transform((v) => v || undefined),
  caption: localized.optional(),
});

export const projectSchema = z.object({
  title: localizedRequired,
  tagline: localized,
  description: localized,
  role: localized,
  year: z.string().trim().min(1).max(20),
  category: z.enum(PROJECT_CATEGORIES),
  technologies: z.array(z.string().trim().min(1)),
  highlights: localizedList,
  cover: z.string().trim().default(""),
  media: z.array(mediaSchema),
  demoUrl: optionalUrl,
  githubUrl: optionalUrl,
  featured: z.boolean().default(false),
});

export const skillGroupSchema = z.object({
  title: localizedRequired,
  skills: z.array(
    z.object({
      name: z.string().trim().min(1),
      level: localized
        .optional()
        .transform((l) => (l && (l.en || l.ar) ? l : undefined)),
    }),
  ),
});

export const experienceSchema = z.object({
  kind: z.enum(EXPERIENCE_KINDS),
  company: localizedRequired,
  position: localized,
  bullets: localizedList,
  startDate: yearMonth,
  endDate: yearMonth,
  technologies: z.array(z.string().trim().min(1)),
  location: localized
    .nullable()
    .optional()
    .transform((l) => (l && (l.en || l.ar) ? l : null)),
});

export const orderSchema = z.object({ ids: z.array(z.uuid()) });
