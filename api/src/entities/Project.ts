import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  PROJECT_CATEGORIES,
  type Localized,
  type LocalizedList,
  type ProjectCategory,
  type ProjectMedia,
} from "../types";

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "json" })
  title: Localized;

  @Column({ type: "json" })
  tagline: Localized;

  @Column({ type: "json" })
  description: Localized;

  @Column({ type: "json" })
  role: Localized;

  @Column({ type: "varchar", length: 20 })
  year: string;

  @Column({ type: "enum", enum: PROJECT_CATEGORIES })
  category: ProjectCategory;

  @Column({ type: "json" })
  technologies: string[];

  @Column({ type: "json" })
  highlights: LocalizedList;

  @Column({ type: "varchar", length: 500, default: "" })
  cover: string;

  @Column({ type: "json" })
  media: ProjectMedia[];

  @Column({ name: "demo_url", type: "varchar", length: 500, nullable: true })
  demoUrl: string | null;

  @Column({ name: "github_url", type: "varchar", length: 500, nullable: true })
  githubUrl: string | null;

  @Column({ type: "boolean", default: false })
  featured: boolean;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;
}
