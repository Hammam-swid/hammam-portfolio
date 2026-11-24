import { useCallback, useEffect, useState } from "react";
import { errorMessage, resources } from "./api";
import type { ResourceName } from "../types";

/** Loads a resource list and exposes reorder/remove helpers that keep local state in sync. */
export function useResourceList<T extends { id: string }>(name: ResourceName) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await resources.list<T>(name));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const move = async (index: number, delta: -1 | 1) => {
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    [next[index], next[to]] = [next[to], next[index]];
    setItems(next);
    try {
      await resources.reorder(name, next.map((i) => i.id));
    } catch (e) {
      setError(errorMessage(e));
      void reload();
    }
  };

  const remove = async (id: string) => {
    try {
      await resources.remove(name, id);
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return { items, setItems, loading, error, reload, move, remove };
}
