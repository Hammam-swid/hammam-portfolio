/**
 * Imports the original JSON content (seed/*.json) into MySQL.
 *
 * - Every record gets a fresh UUID; array order becomes sort_order.
 * - Project media under seed/media/<folder>/<file> is copied to
 *   UPLOAD_DIR/projects/<uuid>/ and paths are rewritten to /uploads/...
 * - Media referenced in the JSON but missing on disk is dropped, so the
 *   site shows its placeholder instead of a broken image.
 *
 * Refuses to run on a non-empty database unless --force is given
 * (which DELETES all projects, skills and experiences first).
 */
import "reflect-metadata";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { config } from "../config";
import { AppDataSource } from "../data-source";
import { Project } from "../entities/Project";
import { SkillGroup } from "../entities/SkillGroup";
import { Experience } from "../entities/Experience";
import type { ProjectMedia } from "../types";

const SEED_DIR = path.resolve(__dirname, "../../seed");
const force = process.argv.includes("--force");

type Raw = Record<string, unknown> & { id?: string };
const read = <T = Raw>(file: string): T[] =>
  JSON.parse(fs.readFileSync(path.join(SEED_DIR, file), "utf8"));

/** "/projects/Bath%20Stream%20platfrom/01-home.png" -> copies file, returns "/uploads/projects/<id>/01-home.png" */
function importMedia(src: string, projectId: string): string | null {
  if (!src) return null;
  const rel = decodeURIComponent(src.replace(/^\/projects\//, ""));
  const from = path.join(SEED_DIR, "media", rel);
  if (!fs.existsSync(from)) return null;
  const name = path
    .basename(rel)
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-");
  const dir = path.join(config.uploadDir, "projects", projectId);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(from, path.join(dir, name));
  return `/uploads/projects/${projectId}/${name}`;
}

async function main() {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();

  const projects = AppDataSource.getRepository(Project);
  const skills = AppDataSource.getRepository(SkillGroup);
  const experiences = AppDataSource.getRepository(Experience);

  const existing = (await projects.count()) + (await skills.count()) + (await experiences.count());
  if (existing && !force) {
    console.error(`Database already has ${existing} records. Re-run with --force to wipe and re-seed.`);
    process.exit(1);
  }
  if (force) {
    await projects.clear();
    await skills.clear();
    await experiences.clear();
  }

  let copied = 0;
  let missing = 0;
  const projectRows = read<Raw & { media: ProjectMedia[]; cover: string }>("projects.json").map(
    ({ id: _old, ...p }, i) => {
      const id = crypto.randomUUID();
      const media = p.media.flatMap((m) => {
        const src = importMedia(m.src, id);
        if (!src) {
          missing++;
          return [];
        }
        copied++;
        const poster = m.poster ? importMedia(m.poster, id) ?? undefined : undefined;
        return [{ ...m, src, poster }];
      });
      return projects.create({
        ...(p as object),
        id,
        media,
        cover: importMedia(p.cover, id) ?? media.find((m) => m.type === "image")?.src ?? "",
        sortOrder: i,
      } as Partial<Project>);
    },
  );
  await projects.save(projectRows);

  await skills.save(
    read("skills.json").map(({ id: _old, ...s }, i) =>
      skills.create({ ...(s as object), id: crypto.randomUUID(), sortOrder: i } as Partial<SkillGroup>),
    ),
  );

  await experiences.save(
    read("experiences.json").map(({ id: _old, ...e }, i) =>
      experiences.create({
        ...(e as object),
        id: crypto.randomUUID(),
        sortOrder: i,
      } as Partial<Experience>),
    ),
  );

  console.log(
    `Seeded ${projectRows.length} projects (${copied} media files copied, ${missing} missing skipped), ` +
      `${await skills.count()} skill groups, ${await experiences.count()} experiences.`,
  );
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
