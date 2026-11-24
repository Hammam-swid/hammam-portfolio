// Mirrors api/src/types.ts and the portfolio's src/types/index.ts.

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
  src: string;
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
  cover: string;
  media: ProjectMedia[];
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface Skill {
  name: string;
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
  startDate?: string;
  endDate?: string;
  technologies: string[];
  location?: Localized;
}

export type ResourceName = "projects" | "skills" | "experiences";
