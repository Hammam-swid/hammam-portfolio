import "reflect-metadata";
import fs from "node:fs";
import { config } from "./config";
import { AppDataSource } from "./data-source";
import { createApp } from "./app";

async function main() {
  // Fail fast on missing secrets instead of on the first login.
  void config.jwtSecret;
  void config.adminPasswordHash;

  fs.mkdirSync(config.uploadDir, { recursive: true });
  await AppDataSource.initialize();
  // Apply pending migrations on boot — handy on cPanel, where there may be no SSH.
  const ran = await AppDataSource.runMigrations({ transaction: "each" });
  if (ran.length) console.log(`Ran migrations: ${ran.map((m) => m.name).join(", ")}`);

  createApp().listen(config.port, () => {
    console.log(`API listening on :${config.port} (uploads: ${config.uploadDir})`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
