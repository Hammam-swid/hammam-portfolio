import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap, useGSAP, MOTION_OK } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import MediaWheel, { type WheelHandle } from "./MediaWheel";
import Icon from "../fx/Icon";
import { deckTop } from "../../lib/deck";

const WIDE = "(min-width: 1024px)";
function useWide() {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(WIDE);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(WIDE).matches,
  );
}

/**
 * One project in the stacked deck: details on one side, the media wheel on
 * the other, and a large "now showing" frame for whatever the wheel lands on.
 */
export default function DeckPanel({
  project,
  index,
  total,
  seed,
  onOpen,
}: {
  project: Project;
  index: number;
  total: number;
  seed: number;
  onOpen: (p: Project, origin: DOMRect | undefined, mediaIndex: number) => void;
}) {
  const { t, l, lang, isRTL } = useLang();
  const wide = useWide();
  const root = useRef<HTMLElement>(null);
  const previewRef = useRef<HTMLButtonElement>(null);
  const wheel = useRef<WheelHandle>(null);
  const [shown, setShown] = useState({ cur: 0, prev: -1 });
  const [live, setLive] = useState(0);
  const media = project.media;
  const n = media.length;

  // The pointer faces the preview: left/right of the wheel on desktop, its top on phones.
  const pointerAt = wide ? (isRTL ? 90 : 270) : 0;
  const revealFrom = wide ? (isRTL ? "0% 50%" : "100% 50%") : "50% 100%";

  const select = (i: number) => {
    setLive(i);
    setShown((s) => (s.cur === i ? s : { cur: i, prev: s.cur }));
  };

  // New media wipes in from the wheel's side, as if the wheel threw it there.
  useLayoutEffect(() => {
    if (shown.prev < 0) return;
    const el = previewRef.current?.querySelector("[data-layer='cur']");
    if (!el) return;
    gsap.fromTo(
      el,
      { clipPath: `circle(0% at ${revealFrom})`, scale: 1.08 },
      { clipPath: `circle(150% at ${revealFrom})`, scale: 1, duration: 1, ease: "expo.out" },
    );
  }, [shown, revealFrom]);

  // First time the panel is properly in view, give the wheel a spin.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        gsap.from("[data-rise]", {
          y: 30,
          autoAlpha: 0,
          stagger: 0.07,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
          onComplete: () => wheel.current?.spin(),
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [lang] },
  );

  const current = media[shown.cur];
  const wheelEl = (
    <MediaWheel
      ref={wheel}
      media={media}
      title={l(project.title)}
      seed={seed}
      pointerAt={pointerAt}
      onTick={setLive}
      onSettle={select}
      className="h-full w-full"
    />
  );

  const preview = (
    <button
      ref={previewRef}
      type="button"
      onClick={() => onOpen(project, previewRef.current?.getBoundingClientRect(), shown.cur)}
      aria-label={`${t("projects.details")}: ${l(project.title)}`}
      className="group/pv relative block aspect-video w-full overflow-hidden rounded-2xl border border-line bg-[#05060f] text-start shadow-[var(--shadow)]"
    >
      {shown.prev >= 0 && (
        <div className="absolute inset-0" data-layer="prev">
          <MediaFrame media={media[shown.prev]} title={l(project.title)} seed={seed} />
        </div>
      )}
      <div key={shown.cur} className="absolute inset-0" data-layer="cur">
        <MediaFrame media={current} title={l(project.title)} seed={seed} active />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-[#05060f]/85 to-transparent p-4 pt-10 text-white">
        <span className="min-w-0">
          <span className="block text-[11px] uppercase tracking-[0.14em] text-white/60 rtl:tracking-normal">
            {t("projects.nowShowing")}
          </span>
          <span className="line-clamp-1 text-sm font-medium">
            {current?.caption ? l(current.caption) : t(current?.type === "video" ? "projects.video" : "projects.image")}
          </span>
        </span>
        <span dir="ltr" className="shrink-0 font-mono text-sm tabular-nums">
          <span className="text-[#93c2db]">{String(Math.max(0, live) + 1).padStart(2, "0")}</span>
          <span className="text-white/50"> / {String(Math.max(1, n)).padStart(2, "0")}</span>
        </span>
      </div>
      <span className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover/pv:opacity-100">
        <Icon name="external" size={16} />
      </span>
    </button>
  );

  return (
    <article ref={root} data-panel className="lg:sticky" style={{ top: deckTop(index) }}>
      <div
        data-panel-inner
        className="spot relative origin-top overflow-hidden lg:h-[min(600px,calc(100svh-190px))] lg:min-h-[480px]"
      >
        <div className="flex h-full flex-col gap-6 p-5 md:p-8 lg:grid lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.7fr)] lg:gap-8 lg:p-10">
          {/* Details */}
          <div className="flex min-w-0 flex-col gap-4 lg:justify-center">
            <div data-rise className="flex items-center gap-3">
              <span
                dir="ltr"
                className="font-mono text-5xl font-black leading-none text-transparent md:text-6xl"
                style={{ WebkitTextStroke: "1.5px var(--accent)" }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex flex-col gap-1">
                <span className="chip w-fit">{t(`projects.filters.${project.category}`)}</span>
                <span dir="ltr" className="font-mono text-xs text-faint rtl:text-right">
                  {project.year} · {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
                </span>
              </span>
            </div>
            <h2 data-rise className="m-0 text-3xl font-black leading-tight md:text-4xl">
              {l(project.title)}
            </h2>
            <p data-rise className="m-0 line-clamp-3 text-[15px] leading-7 text-muted">
              {l(project.tagline)}
            </p>
            <p data-rise className="m-0 text-sm text-faint">
              {l(project.role)}
            </p>
            <div data-rise dir="ltr" className="flex flex-wrap gap-2 rtl:justify-end">
              {project.technologies.slice(0, 6).map((tech) => (
                <span key={tech} className="chip">
                  {tech}
                </span>
              ))}
            </div>
            <div data-rise className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onOpen(project, previewRef.current?.getBoundingClientRect(), shown.cur)}
              >
                {t("projects.details")}
                <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
              </button>
              {project.demoUrl && (
                <a className="btn btn-ghost !px-3" href={project.demoUrl} target="_blank" rel="noreferrer" aria-label={t("projects.viewDemo")}>
                  <Icon name="external" size={18} />
                </a>
              )}
              {project.githubUrl && (
                <a className="btn btn-ghost !px-3" href={project.githubUrl} target="_blank" rel="noreferrer" aria-label={t("projects.viewCode")}>
                  <Icon name="github" size={18} />
                </a>
              )}
            </div>
            {wide && (
              <p data-rise className="m-0 flex items-center gap-2 text-xs text-faint">
                <Icon name="spin" size={13} /> {t("projects.wheelHint")}
              </p>
            )}
          </div>

          {/* Stage: preview + wheel */}
          {wide ? (
            <div className="relative min-w-0 [container-type:size] [--d:min(92cqh,72cqw)]">
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ insetInlineStart: 0, width: "calc(100% - var(--d) * 0.42 - 44px)" }}
              >
                {preview}
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2"
                style={{ width: "var(--d)", height: "var(--d)", insetInlineEnd: "calc(var(--d) * -0.58)" }}
              >
                {wheelEl}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div data-rise>{preview}</div>
              <div className="relative mx-auto -mb-5 aspect-[1/0.62] w-[min(100%,400px)] overflow-hidden md:-mb-8">
                <div className="absolute inset-x-[5%] top-[7%] aspect-square">{wheelEl}</div>
              </div>
            </div>
          )}
        </div>
        {!wide && (
          <p className="m-0 flex items-center justify-center gap-2 border-t border-line py-2.5 text-xs text-faint">
            <Icon name="spin" size={13} /> {t("projects.wheelHint")}
          </p>
        )}
      </div>
    </article>
  );
}
