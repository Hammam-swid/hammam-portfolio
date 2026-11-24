import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorBox, PageHeader } from "../components/Layout";
import { errorMessage, resources } from "../lib/api";
import type { Project } from "../types";

export default function Dashboard() {
  const [counts, setCounts] = useState<{ projects: number; featured: number; skills: number; experiences: number }>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      resources.list<Project>("projects"),
      resources.list("skills"),
      resources.list("experiences"),
    ])
      .then(([p, s, e]) =>
        setCounts({ projects: p.length, featured: p.filter((x) => x.featured).length, skills: s.length, experiences: e.length }),
      )
      .catch((e) => setError(errorMessage(e)));
  }, []);

  const tiles = [
    { to: "/projects", label: "Projects", value: counts?.projects, sub: counts && `${counts.featured} featured` },
    { to: "/skills", label: "Skill groups", value: counts?.skills },
    { to: "/experiences", label: "Experience entries", value: counts?.experiences },
  ];

  return (
    <>
      <PageHeader title="Dashboard" />
      <ErrorBox message={error} />
      <div className="grid gap-3 sm:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="card p-5 transition hover:border-accent">
            <p className="text-sm text-muted">{t.label}</p>
            <p className="mt-1 text-3xl font-semibold tabular-nums">{t.value ?? "–"}</p>
            {t.sub && <p className="mt-1 text-xs text-muted">{t.sub}</p>}
          </Link>
        ))}
      </div>
    </>
  );
}
