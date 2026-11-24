import "reflect-metadata";
import path from "node:path";
import { DataSource } from "typeorm";
import { config } from "./config";
import { Project } from "./entities/Project";
import { SkillGroup } from "./entities/SkillGroup";
import { Experience } from "./entities/Experience";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: config.db.host,
  port: config.db.port,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  charset: "utf8mb4_unicode_ci",
  entities: [Project, SkillGroup, Experience],
  // Works for both src/*.ts (tsx) and dist/*.js (production)
  migrations: [path.join(__dirname, "migrations", "*.{ts,js}")],
  synchronize: false,
  logging: false,
});
