import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { ProjectCategory } from "../types";
import { useLang } from "../hooks/useLang";
import { useAsync } from "../hooks/useAsync";
import { ProjectsService } from "../services/data";
import { gsap, Flip, useGSAP, MOTION_OK } from "../lib/gsap";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectModal from "../components/projects/ProjectModal";
import Icon from "../components/fx/Icon";

type Filter = "all" | ProjectCategory;
const FILTERS: Filter[] = ["all", "fullstack", "frontend", "backend"];

export default function ProjectsPage() {
  const { t, lang } = useLang();
  const { data: projects, loading, error } = useAsync(ProjectsService.getAll);
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const root = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const flipState = useRef<Flip.FlipState | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);

  const visible = useMemo(
    () => (projects ?? []).filter((p) => filter === "all" || p.category === filter),
    [projects, filter],
  );

  const openId = params.get("p");
  const openIndex = projects?.findIndex((p) => p.id === openId) ?? -1;

  // Intro animation
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-intro]", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  );

  // Cards fly in once data arrives
  useGSAP(
    () => {
      if (!projects) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-card]", {
          y: 80,
          autoAlpha: 0,
          rotateX: -12,
          stagger: 0.08,
          duration: 0.9,
          ease: "power3.out",
          clearProps: "transform,opacity,visibility",
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [projects] },
  );

  // FLIP between filter states
  const changeFilter = (f: Filter) => {
    if (f === filter) return;
    if (grid.current) flipState.current = Flip.getState(grid.current.querySelectorAll("[data-card]"));
    setFilter(f);
  };

  useLayoutEffect(() => {
    if (!flipState.current || !grid.current) return;
    Flip.from(flipState.current, {
      targets: grid.current.querySelectorAll("[data-card]"),
      duration: 0.6,
      ease: "power3.inOut",
      absolute: true,
      scale: true,
      onEnter: (els) => gsap.fromTo(els, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { autoAlpha: 0, scale: 0.85, duration: 0.35 }),
    });
    flipState.current = null;
  }, [filter]);

  // Sliding pill under the active filter
  useLayoutEffect(() => {
    const btn = tabsRef.current?.querySelector<HTMLElement>(`[data-f="${filter}"]`);
    if (!btn || !pillRef.current) return;
    gsap.to(pillRef.current, {
      x: btn.offsetLeft,
      width: btn.offsetWidth,
      duration: 0.45,
      ease: "power3.out",
    });
  }, [filter, lang, projects]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects?.length ?? 0 };
    projects?.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [projects]);

  const open = (id: string) => setParams({ p: id }, { replace: false });
  const close = () => setParams({}, { replace: false });

  return (
    <div ref={root} className="relative">
      <header className="grid-bg noise relative overflow-hidden pb-16 pt-36 md:pb-20 md:pt-44">
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 end-[-10%] h-[560px] w-[560px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle,#2b87b8,transparent 70%)" }} />
        <div className="container-x relative flex flex-col gap-6">
          <Link data-intro to="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
            <Icon name="arrow" size={16} className="ltr:-scale-x-100" />
            {t("projects.back")}
          </Link>
          <h1 data-intro className="m-0 text-[56px] font-black leading-[1.1] tracking-tight md:text-[96px]">
            <span className="text-gradient">{t("projects.pageTitle")}</span>
            <sup dir="ltr" className="ms-3 align-super font-mono text-xl font-normal text-accent md:text-2xl">
              ({String(projects?.length ?? 0).padStart(2, "0")})
            </sup>
          </h1>
          <p data-intro className="m-0 max-w-2xl text-lg text-muted md:text-xl">
            {t("projects.pageSubtitle")}
          </p>
        </div>
      </header>

      <section className="container-x pb-28">
        <div className="sticky top-[68px] z-30 -mx-3 mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[color-mix(in_srgb,var(--bg)_85%,transparent)] px-3 py-3 backdrop-blur-xl">
          <div
            ref={tabsRef}
            role="group"
            aria-label={t("projects.pageTitle")}
            className="relative flex gap-1 overflow-x-auto rounded-full border border-line bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] p-1 backdrop-blur-xl"
          >
            <span ref={pillRef} aria-hidden="true" className="absolute left-0 top-1 h-[calc(100%-8px)] rounded-full bg-primary" />
            {FILTERS.map((f) => (
              <button
                key={f}
                data-f={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => changeFilter(f)}
                className={`relative z-10 flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  filter === f ? "text-on-primary" : "text-muted hover:text-ink"
                }`}
              >
                {t(`projects.filters.${f}`)}
                <span dir="ltr" className="font-mono text-xs opacity-70">
                  {counts[f] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <p className="m-0 text-sm text-faint" aria-live="polite">
            {t("projects.count", { count: visible.length })}
          </p>
        </div>

        {loading && <p className="text-muted">{t("common.loading")}</p>}
        {error && <p className="text-[#e26b6b]">{t("common.error")}</p>}

        <div ref={grid} className="grid gap-6 [perspective:1400px] md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => {
            const i = projects!.indexOf(p);
            return (
              <div key={p.id} data-card data-flip-id={p.id} className={i === 0 && filter === "all" ? "md:col-span-2" : ""}>
                <ProjectCard project={p} index={i} size={i === 0 && filter === "all" ? "lg" : "md"} wide={i === 0 && filter === "all"} onOpen={() => open(p.id)} />
              </div>
            );
          })}
        </div>
      </section>

      {projects && openIndex >= 0 && (
        <ProjectModal project={projects[openIndex]} seed={openIndex} onClose={close} />
      )}
    </div>
  );
}
