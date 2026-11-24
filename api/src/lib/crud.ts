import { Router } from "express";
import { z } from "zod";
import type { DeepPartial, EntityTarget, FindOptionsWhere, ObjectLiteral } from "typeorm";
import { In } from "typeorm";
import { AppDataSource } from "../data-source";
import { requireAuth } from "./auth";
import { HttpError } from "./http";
import { orderSchema } from "./schemas";
import { removeUploads } from "./uploads";

interface Base extends ObjectLiteral {
  id: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

/** Strips DB-only columns and turns nulls into absent keys (matches the site's types). */
export function toPublic<T extends Base>(row: T) {
  const { sortOrder: _s, createdAt: _c, updatedAt: _u, ...rest } = row;
  return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== null));
}

const isUuid = (id: string) => z.uuid().safeParse(id).success;

/**
 * Public list/read + authenticated create/update/delete/reorder for one entity.
 * `mediaOf` lists the uploaded files a row references so they're deleted with it.
 */
export function crudRouter<T extends Base>(opts: {
  entity: EntityTarget<T>;
  schema: z.ZodType;
  mediaOf?: (row: T) => string[];
  listWhere?: (query: Record<string, unknown>) => FindOptionsWhere<T> | undefined;
}) {
  const repo = () => AppDataSource.getRepository(opts.entity);
  const order = { sortOrder: "ASC", createdAt: "ASC" } as never;
  const router = Router();

  const findOr404 = async (id: string) => {
    const row = isUuid(id) ? await repo().findOneBy({ id } as FindOptionsWhere<T>) : null;
    if (!row) throw new HttpError(404, "Not found");
    return row;
  };

  router.get("/", async (req, res) => {
    const rows = await repo().find({ where: opts.listWhere?.(req.query), order });
    // Always revalidate (cheap 304 via ETag) so admin edits show up immediately.
    res.set("Cache-Control", "no-cache");
    res.json(rows.map(toPublic));
  });

  router.get("/:id", async (req, res) => {
    res.json(toPublic(await findOr404(String(req.params.id))));
  });

  router.post("/", requireAuth, async (req, res) => {
    const data = opts.schema.parse(req.body) as object;
    const max = await repo().maximum("sortOrder" as never);
    const row = repo().create({ ...data, sortOrder: (max ?? -1) + 1 } as unknown as DeepPartial<T>);
    res.status(201).json(toPublic(await repo().save(row)));
  });

  router.put("/order", requireAuth, async (req, res) => {
    const { ids } = orderSchema.parse(req.body);
    await AppDataSource.transaction(async (m) => {
      for (const [i, id] of ids.entries())
        await m.update(opts.entity, { id } as never, { sortOrder: i } as never);
    });
    const rows = await repo().find({ where: { id: In(ids) } as never, order });
    res.json(rows.map(toPublic));
  });

  router.put("/:id", requireAuth, async (req, res) => {
    const row = await findOr404(String(req.params.id));
    const before = opts.mediaOf?.(row) ?? [];
    const data = opts.schema.parse(req.body);
    // Plain assign (not repo.merge, which deep-merges JSON arrays) so removed items disappear.
    const saved = await repo().save(Object.assign(row, data));
    if (opts.mediaOf) {
      const after = new Set(opts.mediaOf(saved));
      await removeUploads(before.filter((s) => !after.has(s)));
    }
    res.json(toPublic(saved));
  });

  router.delete("/:id", requireAuth, async (req, res) => {
    const row = await findOr404(String(req.params.id));
    const media = opts.mediaOf?.(row) ?? [];
    await repo().remove(row);
    await removeUploads(media);
    res.status(204).end();
  });

  return router;
}
