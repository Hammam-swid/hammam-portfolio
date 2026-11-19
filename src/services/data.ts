import axios from "axios";
import type { Experience, Project, SkillGroup } from "../types";

const cache = new Map<string, Promise<unknown>>();

/** Fetches a JSON file from /public/data once and caches the promise. */
function load<T>(file: string): Promise<T> {
  if (!cache.has(file)) {
    const req = axios.get<T>(`/data/${file}`).then((r) => r.data);
    req.catch(() => cache.delete(file));
    cache.set(file, req);
  }
  return cache.get(file) as Promise<T>;
}

export const ProjectsService = {
  getAll: () => load<Project[]>("projects.json"),
  getFeatured: async () =>
    (await load<Project[]>("projects.json")).filter((p) => p.featured),
};

export const SkillsService = {
  getAll: () => load<SkillGroup[]>("skills.json"),
};

export const ExperiencesService = {
  getAll: () => load<Experience[]>("experiences.json"),
};
