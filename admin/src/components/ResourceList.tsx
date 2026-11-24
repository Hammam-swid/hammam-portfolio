import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useResourceList } from "../lib/useResource";
import type { ResourceName } from "../types";
import { ErrorBox, PageHeader } from "./Layout";

/** Ordered list with reorder / edit / delete — shared by projects, skills and experiences. */
export default function ResourceList<T extends { id: string }>({
  name,
  title,
  newLabel,
  render,
  label,
  extra,
}: {
  name: ResourceName;
  title: string;
  newLabel: string;
  /** main content of a row */
  render: (item: T) => ReactNode;
  /** used in the delete confirmation */
  label: (item: T) => string;
  /** optional per-row actions, e.g. a featured toggle */
  extra?: (item: T, list: ReturnType<typeof useResourceList<T>>) => ReactNode;
}) {
  const list = useResourceList<T>(name);
  const { items, loading, error, move, remove } = list;

  return (
    <>
      <PageHeader title={title}>
        <Link to={`/${name}/new`} className="btn-primary">
          + {newLabel}
        </Link>
      </PageHeader>
      <ErrorBox message={error} />
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center text-muted">Nothing here yet.</div>
      ) : (
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={item.id} className="card flex items-center gap-3 p-3">
              <div className="flex flex-col gap-1">
                <button className="btn-icon size-7" title="Move up" disabled={i === 0} onClick={() => move(i, -1)}>
                  ↑
                </button>
                <button
                  className="btn-icon size-7"
                  title="Move down"
                  disabled={i === items.length - 1}
                  onClick={() => move(i, 1)}
                >
                  ↓
                </button>
              </div>
              <div className="min-w-0 flex-1">{render(item)}</div>
              <div className="flex shrink-0 flex-wrap justify-end gap-2">
                {extra?.(item, list)}
                <Link to={`/${name}/${item.id}`} className="btn-ghost">
                  Edit
                </Link>
                <button
                  className="btn-danger"
                  onClick={() => {
                    if (confirm(`Delete "${label(item)}"? This also deletes its uploaded files and cannot be undone.`))
                      void remove(item.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {items.length > 1 && <p className="mt-3 text-xs text-muted">Order here is the order on the website.</p>}
    </>
  );
}
