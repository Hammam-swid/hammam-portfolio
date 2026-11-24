// Type definitions for portfolio data

export type Lang = "en" | "ar";

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
  /** Path served by the API, e.g. /uploads/projects/<id>/dashboard.png */
  src: string;
  /** Optional poster frame for videos */
  poster?: string;
  caption?: Localized;
}

export type ProjectCategory = "fullstack" | "frontend" | "backend";

export interface Project {
  id: string;
  title: Localized;
  tagline: Localized;
  description: Localized;
  role: Localized;
  year: string;
  category: ProjectCategory;
  technologies: string[];
  highlights: LocalizedList;
  /** Cover image shown on cards */
  cover: string;
  /** Screenshots and videos shown in the project gallery */
  media: ProjectMedia[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface Skill {
  name: string;
  /** e.g. "Basic" — shown as a small badge */
  level?: Localized;
}

export interface SkillGroup {
  id: string;
  title: Localized;
  skills: Skill[];
}

export type ExperienceKind = "job" | "freelance" | "education";

export interface Experience {
  id: string;
  kind: ExperienceKind;
  company: Localized;
  position: Localized;
  bullets: LocalizedList;
  startDate?: string; // YYYY-MM (optional for education)
  endDate?: string; // YYYY-MM, undefined = present
  technologies: string[];
  location?: Localized;
}
