// Shapes returned by the public API. Kept identical to the portfolio's
// src/types/index.ts so the site and the admin panel can consume them directly.

export interface Localized {
  en: string;
  ar: string;
}

export interface LocalizedList {
  en: string[];
  ar: string[];
}

export interface ProjectMedia {
  type: "image" | "video";
  /** Path served by this API, e.g. /uploads/projects/<file>.png */
  src: string;
  poster?: string;
  caption?: Localized;
}

export const PROJECT_CATEGORIES = ["fullstack", "frontend", "backend"] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export interface Skill {
  name: string;
  level?: Localized;
}

export const EXPERIENCE_KINDS = ["job", "freelance", "education"] as const;
export type ExperienceKind = (typeof EXPERIENCE_KINDS)[number];
