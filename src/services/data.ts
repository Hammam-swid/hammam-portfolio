import axios from "axios";
import type { Experience, Project, SkillGroup } from "../types";
import { API_URL } from "../lib/media";

const api = axios.create({ baseURL: `${API_URL}/api` });
const cache = new Map<string, Promise<unknown>>();

/** Fetches an API endpoint once and caches the promise. */
function load<T>(path: string): Promise<T> {
  if (!cache.has(path)) {
    const req = api.get<T>(path).then((r) => r.data);
    req.catch(() => cache.delete(path));
    cache.set(path, req);
  }
  return cache.get(path) as Promise<T>;
}

export const ProjectsService = {
  getAll: () => load<Project[]>("/projects"),
  getFeatured: () => load<Project[]>("/projects?featured=1"),
};

export const SkillsService = {
  getAll: () => load<SkillGroup[]>("/skills"),
};

export const ExperiencesService = {
  getAll: () => load<Experience[]>("/experiences"),
};
