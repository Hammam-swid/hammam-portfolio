import axios, { AxiosError } from "axios";
import type { ProjectMedia, ResourceName } from "../types";

export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const TOKEN_KEY = "portfolio-admin-token";

export const tokenStore = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set: (t: string | null) => {
    try {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* storage unavailable */
    }
  },
};

export const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((cfg) => {
  const t = tokenStore.get();
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (r) => r,
  (err: AxiosError) => {
    if (err.response?.status === 401 && !err.config?.url?.includes("/auth/login")) onUnauthorized();
    return Promise.reject(err);
  },
);

/** Human-readable message from an API error. */
export function errorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data as
      | { error?: string; issues?: { path: string; message: string }[] }
      | undefined;
    if (data?.issues?.length)
      return data.issues.map((i) => `${i.path || "body"}: ${i.message}`).join("\n");
    if (data?.error) return data.error;
    if (!err.response) return `Cannot reach the API at ${API_URL}`;
  }
  return err instanceof Error ? err.message : String(err);
}

/** Absolute URL for a stored media path (/uploads/... lives on the API host). */
export const mediaUrl = (src?: string) =>
  !src ? "" : /^https?:\/\//.test(src) ? src : `${API_URL}${src.startsWith("/") ? "" : "/"}${src}`;

export const resources = {
  list: <T>(name: ResourceName) => api.get<T[]>(`/${name}`).then((r) => r.data),
  get: <T>(name: ResourceName, id: string) => api.get<T>(`/${name}/${id}`).then((r) => r.data),
  create: <T>(name: ResourceName, body: unknown) => api.post<T>(`/${name}`, body).then((r) => r.data),
  update: <T>(name: ResourceName, id: string, body: unknown) =>
    api.put<T>(`/${name}/${id}`, body).then((r) => r.data),
  remove: (name: ResourceName, id: string) => api.delete(`/${name}/${id}`),
  reorder: (name: ResourceName, ids: string[]) => api.put(`/${name}/order`, { ids }),
};

export interface UploadedFile {
  src: string;
  type: ProjectMedia["type"];
  name: string;
  size: number;
}

export function uploadFiles(
  files: File[],
  folder: string,
  onProgress?: (pct: number) => void,
): Promise<UploadedFile[]> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return api
    .post<UploadedFile[]>("/uploads", form, {
      params: { folder },
      onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
    })
    .then((r) => r.data);
}
