import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  EXPERIENCE_KINDS,
  type ExperienceKind,
  type Localized,
  type LocalizedList,
} from "../types";

@Entity("experiences")
export class Experience {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "enum", enum: EXPERIENCE_KINDS })
  kind: ExperienceKind;

  @Column({ type: "json" })
  company: Localized;

  @Column({ type: "json" })
  position: Localized;

  @Column({ type: "json" })
  bullets: LocalizedList;

  /** YYYY-MM */
  @Column({ name: "start_date", type: "varchar", length: 7, nullable: true })
  startDate: string | null;

  /** YYYY-MM, null = present */
  @Column({ name: "end_date", type: "varchar", length: 7, nullable: true })
  endDate: string | null;

  @Column({ type: "json" })
  technologies: string[];

  @Column({ type: "json", nullable: true })
  location: Localized | null;

  @Column({ name: "sort_order", type: "int", default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: "created_at", type: "datetime" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: "datetime" })
  updatedAt: Date;
}
