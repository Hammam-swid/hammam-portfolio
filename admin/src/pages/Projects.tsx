import { useFormContext } from "react-hook-form";
import ResourceList from "../components/ResourceList";
import ResourceForm, { Section } from "../components/ResourceForm";
import MediaManager from "../components/MediaManager";
import { Field, LocalizedInput, LocalizedLinesInput, TagInput } from "../components/fields";
import { errorMessage, mediaUrl, resources } from "../lib/api";
import type { Project } from "../types";

const CATEGORIES = [
  { value: "fullstack", label: "Full-stack" },
  { value: "frontend", label: "Frontend" },
  { value: "backend", label: "Backend" },
];

export function ProjectsList() {
  return (
    <ResourceList<Project>
      name="projects"
      title="Projects"
      newLabel="New project"
      label={(p) => p.title.en}
      render={(p) => {
        const thumb = p.cover || p.media.find((m) => m.type === "image")?.src;
        return (
          <div className="flex items-center gap-3">
            <div className="hidden aspect-video w-24 shrink-0 overflow-hidden rounded-md bg-panel-2 sm:block">
              {thumb && <img src={mediaUrl(thumb)} alt="" className="h-full w-full object-cover" loading="lazy" />}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{p.title.en}</p>
              <p className="truncate text-sm text-muted" dir="rtl">
                {p.title.ar}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                {p.year} · {p.category} · {p.media.length} media
              </p>
            </div>
          </div>
        );
      }}
      extra={(p, { setItems }) => (
        <button
          className={p.featured ? "btn-primary" : "btn-ghost"}
          title="Featured projects appear on the home page"
          onClick={async () => {
            const featured = !p.featured;
            setItems((xs) => xs.map((x) => (x.id === p.id ? { ...x, featured } : x)));
            try {
              const { id: _id, ...body } = { ...p, featured };
              await resources.update("projects", p.id, body);
            } catch (e) {
              alert(errorMessage(e));
              setItems((xs) => xs.map((x) => (x.id === p.id ? { ...x, featured: !featured } : x)));
            }
          }}
        >
          {p.featured ? "★ Featured" : "☆ Feature"}
        </button>
      )}
    />
  );
}

const empty: Omit<Project, "id"> = {
  title: { en: "", ar: "" },
  tagline: { en: "", ar: "" },
  description: { en: "", ar: "" },
  role: { en: "", ar: "" },
  year: String(new Date().getFullYear()),
  category: "fullstack",
  technologies: [],
  highlights: { en: [], ar: [] },
  cover: "",
  media: [],
  demoUrl: "",
  githubUrl: "",
  featured: false,
};

export function ProjectForm() {
  return (
    <ResourceForm<Project>
      name="projects"
      title={(isNew) => (isNew ? "New project" : "Edit project")}
      empty={empty}
      toBody={({ id: _id, ...v }) => ({
        ...v,
        media: v.media.map((m) => ({
          ...m,
          poster: m.type === "video" && m.poster ? m.poster : undefined,
          caption: m.caption && (m.caption.en || m.caption.ar) ? m.caption : undefined,
        })),
      })}
    >
      <Section title="Basics">
        <LocalizedInput name="title" label="Title" required />
        <LocalizedInput name="tagline" label="Tagline" multiline rows={2} />
        <LocalizedInput name="role" label="My role" />
        <BasicsRow />
      </Section>
      <Section title="Description">
        <LocalizedInput name="description" label="Description" multiline rows={6} />
        <LocalizedLinesInput name="highlights" label="Highlights" />
        <TagInput name="technologies" label="Technologies" placeholder="React, Express…" />
      </Section>
      <Section title="Screenshots & videos">
        <MediaManager />
      </Section>
    </ResourceForm>
  );
}

function BasicsRow() {
  const { register } = useFormContext<Project>();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Field label="Year">
        <input className="input" {...register("year", { required: true })} />
      </Field>
      <Field label="Category">
        <select className="input" {...register("category")}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Live demo URL">
        <input className="input" type="url" placeholder="https://" {...register("demoUrl")} />
      </Field>
      <Field label="GitHub URL">
        <input className="input" type="url" placeholder="https://" {...register("githubUrl")} />
      </Field>
      <label className="flex items-center gap-2 text-sm sm:col-span-2 lg:col-span-4">
        <input type="checkbox" className="size-4 accent-accent" {...register("featured")} />
        Featured — show on the home page
      </label>
    </div>
  );
}
