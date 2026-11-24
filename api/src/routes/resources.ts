import { crudRouter } from "../lib/crud";
import { experienceSchema, projectSchema, skillGroupSchema } from "../lib/schemas";
import { Project } from "../entities/Project";
import { SkillGroup } from "../entities/SkillGroup";
import { Experience } from "../entities/Experience";

/** Every uploaded file a project points at (cover, media, posters). */
export const projectMedia = (p: Pick<Project, "cover" | "media">) =>
  [p.cover, ...p.media.flatMap((m) => [m.src, m.poster ?? ""])].filter(Boolean);

export const projectsRouter = crudRouter<Project>({
  entity: Project,
  schema: projectSchema,
  mediaOf: projectMedia,
  listWhere: (q) =>
    q.featured === "1" || q.featured === "true" ? { featured: true } : undefined,
});

export const skillsRouter = crudRouter<SkillGroup>({
  entity: SkillGroup,
  schema: skillGroupSchema,
});

export const experiencesRouter = crudRouter<Experience>({
  entity: Experience,
  schema: experienceSchema,
});
