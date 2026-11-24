/** Base URL of the Express API (projects, skills, experiences and uploaded media). */
export const API_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000").replace(/\/$/, "");

/** Media paths from the API are relative (/uploads/...) and live on the API host. */
export function mediaUrl(src: string): string;
export function mediaUrl(src: string | undefined): string | undefined;
export function mediaUrl(src?: string) {
  if (!src || /^(https?:)?\/\//.test(src) || src.startsWith("data:")) return src;
  return `${API_URL}${src.startsWith("/") ? "" : "/"}${src}`;
}
