import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import Icon from "../fx/Icon";

/** Full-screen project view: media gallery (images + videos) and details. */
export default function ProjectModal({
  project,
  seed,
  onClose,
}: {
  project: Project;
  seed: number;
  onClose: () => void;
}) {
  const { t, l, isRTL } = useLang();
  const [idx, setIdx] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const media = project.media;
  const current = media[idx];
  // width/height of each media item, learned as it loads
  const [ratios, setRatios] = useState<Record<string, number>>({});
  const portrait = current ? (ratios[current.src] ?? 16 / 9) < 1 : false;

  const close = useCallback(() => {
    gsap.to(panelRef.current, {
      autoAlpha: 0,
      y: 30,
      scale: 0.98,
      duration: 0.25,
      ease: "power2.in",
      onComplete: onClose,
    });
  }, [onClose]);

  const goTo = useCallback(
    (next: number, dir: number) => {
      setIdx(next);
      gsap.fromTo(
        stageRef.current,
        { autoAlpha: 0, x: Math.sign(dir) * (isRTL ? -40 : 40) },
        { autoAlpha: 1, x: 0, duration: 0.45, ease: "power3.out" },
      );
    },
    [isRTL],
  );

  const step = useCallback(
    (d: number) => {
      if (media.length < 2) return;
      goTo((idx + d + media.length) % media.length, d);
    },
    [media.length, idx, goTo],
  );

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    gsap.fromTo(
      panelRef.current,
      { autoAlpha: 0, y: 40, scale: 0.97 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, ease: "power3.out" },
    );
    return () => {
      document.body.style.overflow = "";
      prevFocus?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(isRTL ? -1 : 1);
      if (e.key === "ArrowLeft") step(isRTL ? 1 : -1);
      if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], video[controls], [tabindex]:not([tabindex="-1"])',
        );
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close, step, isRTL]);

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-[#05060f]/80 backdrop-blur-md md:items-center md:p-6"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-title"
        className="relative flex max-h-[94svh] w-full max-w-6xl flex-col overflow-hidden rounded-t-3xl border border-line bg-bg-2 shadow-[var(--shadow)] md:rounded-3xl lg:flex-row"
      >
        {/* Gallery */}
        <div className="flex min-w-0 shrink-0 flex-col justify-center bg-[#05060f] lg:shrink lg:flex-[1.6]">
          <div
            ref={stageRef}
            className={`relative w-full transition-[height] duration-300 ${
              portrait ? "h-[min(58svh,560px)] lg:h-[min(72svh,680px)]" : "aspect-video"
            }`}
          >
            <MediaFrame
              key={current?.src ?? "none"}
              media={current}
              title={l(project.title)}
              seed={seed}
              mode="full"
              onRatio={(r) => current && setRatios((m) => (m[current.src] === r ? m : { ...m, [current.src]: r }))}
            />
            {media.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => step(-1)}
                  aria-label={t("projects.prev")}
                  className="absolute start-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                >
                  <Icon name="arrow" className="ltr:-scale-x-100" />
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  aria-label={t("projects.next")}
                  className="absolute end-3 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white backdrop-blur transition hover:bg-black/70"
                >
                  <Icon name="arrow" className="rtl:-scale-x-100" />
                </button>
              </>
            )}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm text-white/70">
            <span>{current?.caption ? l(current.caption) : t("projects.noMedia")}</span>
            <span dir="ltr" className="font-mono text-xs">
              {media.length ? `${idx + 1} / ${media.length}` : ""}
            </span>
          </div>
          {media.length > 1 && (
            <div className="flex gap-2 overflow-x-auto px-4 pb-4 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin]" role="tablist" aria-label={t("projects.media")}>
              {media.map((m, i) => (
                <button
                  key={m.src + i}
                  type="button"
                  role="tab"
                  aria-selected={i === idx}
                  aria-label={`${m.type === "video" ? t("projects.video") : t("projects.image")} ${i + 1}`}
                  onClick={() => i !== idx && goTo(i, i - idx)}
                  className={`relative h-14 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === idx ? "border-[#71aecf]" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <MediaFrame media={m} title="" seed={seed + i} mode="thumb" />
                  {m.type === "video" && (
                    <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                      <Icon name="play" size={14} />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 overflow-y-auto p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="chip w-fit">{t(`projects.filters.${project.category}`)}</span>
              <h2 id="pm-title" className="m-0 text-2xl font-bold leading-snug md:text-3xl">
                {l(project.title)}
              </h2>
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={t("projects.close")}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-accent hover:text-accent"
            >
              <Icon name="close" />
            </button>
          </div>

          <p className="m-0 leading-8 text-muted">{l(project.description)}</p>

          <dl className="m-0 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-line p-4">
              <dt className="text-xs text-faint">{t("projects.role")}</dt>
              <dd className="m-0 mt-1 text-sm font-medium">{l(project.role)}</dd>
            </div>
            <div className="rounded-xl border border-line p-4">
              <dt className="text-xs text-faint">{t("projects.year")}</dt>
              <dd dir="ltr" className="m-0 mt-1 text-sm font-medium rtl:text-right">{project.year}</dd>
            </div>
          </dl>

          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-base font-bold">{t("projects.highlights")}</h3>
            <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
              {l(project.highlights).map((h) => (
                <li key={h} className="flex gap-3 text-[15px] leading-7 text-muted">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="m-0 text-base font-bold">{t("projects.stack")}</h3>
            <div dir="ltr" className="flex flex-wrap gap-2 rtl:justify-end">
              {project.technologies.map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {(project.demoUrl || project.githubUrl) && (
            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              {project.demoUrl && (
                <a className="btn btn-primary" href={project.demoUrl} target="_blank" rel="noreferrer">
                  {t("projects.viewDemo")} <Icon name="external" size={16} />
                </a>
              )}
              {project.githubUrl && (
                <a className="btn btn-ghost" href={project.githubUrl} target="_blank" rel="noreferrer">
                  <Icon name="github" size={18} /> {t("projects.viewCode")}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
