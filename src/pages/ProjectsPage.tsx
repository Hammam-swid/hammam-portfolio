import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Project, ProjectCategory } from "../types";
import { useLang } from "../hooks/useLang";
import { useAsync } from "../hooks/useAsync";
import { ProjectsService } from "../services/data";
import { gsap, ScrollTrigger, useGSAP, MOTION_OK } from "../lib/gsap";
import { deckTop } from "../lib/deck";
import DeckPanel from "../components/projects/DeckPanel";
import ProjectModal from "../components/projects/ProjectModal";
import Letters from "../components/fx/Letters";
import LogoReveal from "../components/fx/LogoReveal";
import Icon from "../components/fx/Icon";

type Filter = "all" | ProjectCategory;
const FILTERS: Filter[] = ["all", "fullstack", "frontend", "backend"];

/**
 * Projects as a stacked deck: each panel sticks under the filter bar and the
 * next one slides over it while the covered one shrinks back and dims.
 */
export default function ProjectsPage() {
  const { t, lang } = useLang();
  const { data: projects, loading, error } = useAsync(ProjectsService.getAll);
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState<Filter>("all");
  const root = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const switching = useRef(false);
  // The logo intro covers the page on arrival; the page's own intro waits for it.
  const [revealed, setRevealed] = useState(false);

  const visible = useMemo(
    () => (projects ?? []).filter((p) => filter === "all" || p.category === filter),
    [projects, filter],
  );

  const openId = params.get("p");
  const openIndex = projects?.findIndex((p) => p.id === openId) ?? -1;

  // Intro + the big title's letters drift apart as the header scrolls away
  useGSAP(
    () => {
      if (!revealed) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-intro]", { y: 40, autoAlpha: 0, stagger: 0.1, duration: 0.9, ease: "power3.out" });
        const pieces = gsap.utils.toArray<HTMLElement>("[data-title] [data-letter]");
        const mid = (pieces.length - 1) / 2;
        // explicit start values: never adopt whatever state the letters happen to be in
        gsap.fromTo(pieces, { x: 0, y: 0, rotate: 0, autoAlpha: 1 }, {
          x: (i) => (i - mid) * 26,
          y: (i) => Math.sin(i * 1.7) * 50 - 30,
          rotate: (i) => (i - mid) * 4,
          autoAlpha: 0.15,
          ease: "none",
          scrollTrigger: { trigger: "[data-header]", start: "top top", end: "bottom top", scrub: 0.4 },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [lang, revealed], revertOnUpdate: true },
  );

  // Deck: covered panels shrink and dim. Phones: panels rise in as they arrive.
  useGSAP(
    () => {
      if (!visible.length) return;
      const panels = gsap.utils.toArray<HTMLElement>("[data-panel]");
      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-width: 1024px)", ok: MOTION_OK }, (ctx) => {
        if (!ctx.conditions!.ok) return;
        const wide = !!ctx.conditions!.wide;
        panels.forEach((panel, i) => {
          const next = panels[i + 1];
          if (!next) return;
          // From its normal look to pushed back and dimmed, while the next panel slides over it.
          const range = { trigger: next, start: "top bottom", end: `top ${deckTop(i + 1, wide)}px`, scrub: true };
          gsap.fromTo(
            panel.querySelector("[data-panel-inner]"),
            { scale: 1 },
            { scale: wide ? 0.9 : 0.92, ease: "none", scrollTrigger: range },
          );
          gsap.fromTo(panel.querySelector("[data-shade]"), { opacity: 0 }, { opacity: 0.6, ease: "none", scrollTrigger: range });
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [visible], revertOnUpdate: true },
  );

  // Filter change: deal the old hand out, then the new one in.
  const changeFilter = (f: Filter) => {
    if (f === filter || switching.current) return;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || !deck.current?.children.length) return setFilter(f);
    switching.current = true;
    gsap.to(deck.current.querySelectorAll("[data-panel]"), {
      autoAlpha: 0,
      y: 40,
      rotate: (i) => (i % 2 ? 2 : -2),
      duration: 0.3,
      stagger: 0.04,
      ease: "power2.in",
      onComplete: () => setFilter(f),
    });
  };

  useLayoutEffect(() => {
    if (!switching.current || !deck.current) return;
    switching.current = false;
    const top = deck.current.getBoundingClientRect().top + window.scrollY - 150;
    if (window.scrollY > top) window.scrollTo({ top });
    gsap.fromTo(
      deck.current.querySelectorAll("[data-panel]"),
      { autoAlpha: 0, y: 80, rotate: (i) => (i % 2 ? -3 : 3) },
      { autoAlpha: 1, y: 0, rotate: 0, duration: 0.8, stagger: 0.08, ease: "expo.out", clearProps: "transform,opacity,visibility" },
    );
    ScrollTrigger.refresh();
  }, [filter]);

  // Sliding pill under the active filter
  useLayoutEffect(() => {
    const btn = tabsRef.current?.querySelector<HTMLElement>(`[data-f="${filter}"]`);
    const pill = pillRef.current;
    const row = tabsRef.current;
    if (!btn || !pill || !row) return;
    // Measure from where the pill is now, so it lands correctly in LTR and
    // RTL and while the tab row is scrolled sideways on phones.
    gsap.killTweensOf(pill);
    const x =
      Number(gsap.getProperty(pill, "x")) + btn.getBoundingClientRect().left - pill.getBoundingClientRect().left;
    gsap.to(pill, { x, width: btn.offsetWidth, duration: 0.45, ease: "power3.out" });
    const r = row.getBoundingClientRect();
    const b = btn.getBoundingClientRect();
    if (b.left < r.left || b.right > r.right) btn.scrollIntoView({ inline: "nearest", block: "nearest" });
  }, [filter, lang, projects]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects?.length ?? 0 };
    projects?.forEach((p) => (c[p.category] = (c[p.category] ?? 0) + 1));
    return c;
  }, [projects]);

  // Where the modal grows from, and which media it starts on (absent for deep links).
  const [from, setFrom] = useState<{ rect?: DOMRect; start: number }>({ start: 0 });
  const open = (p: Project, rect: DOMRect | undefined) => {
    setFrom({ rect, start: 0 });
    setParams({ p: p.id }, { replace: false });
  };
  const close = () => {
    setFrom({ start: 0 });
    setParams({}, { replace: false });
  };

  return (
    <div ref={root} className="relative">
      <LogoReveal onReveal={() => setRevealed(true)} />
      <header data-header className="grid-bg noise relative overflow-hidden pb-16 pt-36 md:pb-20 md:pt-44">
        <div aria-hidden="true" className="pointer-events-none absolute -top-48 end-[-10%] h-[560px] w-[560px] rounded-full opacity-50 blur-3xl" style={{ background: "radial-gradient(circle,#2b87b8,transparent 70%)" }} />
        <div className="container-x relative flex flex-col gap-6">
          <Link data-intro to="/" className="inline-flex w-fit items-center gap-2 text-sm text-muted transition-colors hover:text-accent">
            <Icon name="arrow" size={16} className="ltr:-scale-x-100" />
            {t("projects.back")}
          </Link>
          <h1 data-intro className="m-0 text-[56px] font-black leading-[1.1] tracking-tight rtl:tracking-normal md:text-[96px]">
            <span data-title key={lang}>
              <Letters text={t("projects.pageTitle")} gradient />
            </span>
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
            className="no-scrollbar relative flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-[color-mix(in_srgb,var(--surface)_80%,transparent)] p-1 backdrop-blur-xl"
          >
            <span ref={pillRef} aria-hidden="true" className="absolute left-0 top-1 h-[calc(100%-8px)] rounded-full bg-primary" />
            {FILTERS.map((f) => (
              <button
                key={f}
                data-f={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => changeFilter(f)}
                className={`relative z-10 flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium transition-colors sm:gap-2 sm:px-4 ${
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
          <p className="m-0 hidden text-sm text-faint sm:block" aria-live="polite">
            {t("projects.count", { count: visible.length })}
          </p>
        </div>

        {loading && <p className="text-muted">{t("common.loading")}</p>}
        {error && <p className="text-[#e26b6b]">{t("common.error")}</p>}

        <div ref={deck} className="flex flex-col gap-[14vh] pb-[6vh] lg:gap-[22vh] lg:pb-[10vh]">
          {visible.map((p, i) => (
            <DeckPanel key={p.id} project={p} index={i} total={visible.length} seed={projects!.indexOf(p)} onOpen={open} />
          ))}
        </div>
      </section>

      {projects && openIndex >= 0 && (
        <ProjectModal project={projects[openIndex]} seed={openIndex} origin={from.rect} start={from.start} onClose={close} />
      )}
    </div>
  );
}
