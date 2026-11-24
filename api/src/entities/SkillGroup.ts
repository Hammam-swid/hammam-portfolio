import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import type { Localized, Skill } from "../types";

@Entity("skill_groups")
export class SkillGroup {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "json" })
  title: Localized;

  @Column({ type: "json" })
  skills: Skill[];

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;
}
