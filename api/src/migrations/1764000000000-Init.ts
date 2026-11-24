import type { MigrationInterface, QueryRunner } from "typeorm";

export class Init1764000000000 implements MigrationInterface {
  name = "Init1764000000000";

  public async up(q: QueryRunner): Promise<void> {
    const ts =
      "`created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), " +
      "`updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)";
    const tail = "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    await q.query(
      "CREATE TABLE `projects` (" +
        "`id` varchar(36) NOT NULL, " +
        "`title` json NOT NULL, `tagline` json NOT NULL, `description` json NOT NULL, `role` json NOT NULL, " +
        "`year` varchar(20) NOT NULL, " +
        "`category` enum ('fullstack', 'frontend', 'backend') NOT NULL, " +
        "`technologies` json NOT NULL, `highlights` json NOT NULL, " +
        "`cover` varchar(500) NOT NULL DEFAULT '', " +
        "`media` json NOT NULL, " +
        "`demo_url` varchar(500) NULL, `github_url` varchar(500) NULL, " +
        "`featured` tinyint NOT NULL DEFAULT 0, " +
        "`sort_order` int NOT NULL DEFAULT '0', " +
        ts +
        ", PRIMARY KEY (`id`)) " +
        tail,
    );

    await q.query(
      "CREATE TABLE `skill_groups` (" +
        "`id` varchar(36) NOT NULL, " +
        "`title` json NOT NULL, `skills` json NOT NULL, " +
        "`sort_order` int NOT NULL DEFAULT '0', " +
        ts +
        ", PRIMARY KEY (`id`)) " +
        tail,
    );

    await q.query(
      "CREATE TABLE `experiences` (" +
        "`id` varchar(36) NOT NULL, " +
        "`kind` enum ('job', 'freelance', 'education') NOT NULL, " +
        "`company` json NOT NULL, `position` json NOT NULL, `bullets` json NOT NULL, " +
        "`start_date` varchar(7) NULL, `end_date` varchar(7) NULL, " +
        "`technologies` json NOT NULL, `location` json NULL, " +
        "`sort_order` int NOT NULL DEFAULT '0', " +
        ts +
        ", PRIMARY KEY (`id`)) " +
        tail,
    );
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query("DROP TABLE `experiences`");
    await q.query("DROP TABLE `skill_groups`");
    await q.query("DROP TABLE `projects`");
  }
}
