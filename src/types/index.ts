// Type definitions for portfolio data

export interface Project {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  technologies: string[];
  image: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export interface Skill {
  id: string;
  name: string;
  category: "frontend" | "backend" | "devops" | "tools";
  level: number; // 0-100
  icon?: string;
}

export interface Experience {
  id: string;
  company: {
    en: string;
    ar: string;
  };
  position: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  startDate: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format or undefined for current
  technologies: string[];
  location?: {
    en: string;
    ar: string;
  };
}
