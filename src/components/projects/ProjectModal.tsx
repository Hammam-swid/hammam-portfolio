import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import MediaRing from "./MediaRing";
import Icon from "../fx/Icon";

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FOCUSABLE = 'button, a[href], video[controls], [tabindex]:not([tabindex="-1"])';

/**
 * Project view as a two-sided card. The front shows media only: the current
 * item, with the 3D media ring under it. Flipping the card over, like a
 * playing card, shows the written details on the back.
 */
export default function ProjectModal({
  project,
  seed,
  onClose,
  origin,
  start = 0,
}: {
  project: Project;
  seed: number;
  onClose: () => void;
  /** Box the card flies out of (and back into). */
  origin?: DOMRect;
  /** media item to open on */
  start?: number;
}) {
  const { t, l, isRTL } = useLang();
  const media = project.media;
  const [idx, setIdx] = useState(() => Math.min(start, Math.max(0, media.length - 1)));
  const [flipped, setFlipped] = useState(false);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLElement>(null);
  const backRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const flipping = useRef(false);
  const current = media[idx];
  const spin = isRTL ? -1 : 1;

  /** Transform that puts the card over the box it came from. */
  const fromOrigin = useCallback(() => {
    const scene = sceneRef.current;
    if (!origin || !scene || calm()) return null;
    const s = scene.getBoundingClientRect();
    if (!s.width || !s.height) return null;
    return {
      x: origin.left + origin.width / 2 - (s.left + s.width / 2),
      y: origin.top + origin.height / 2 - (s.top + s.height / 2),
      scaleX: origin.width / s.width,
      scaleY: origin.height / s.height,
    };
  }, [origin]);

  // Open: the card flies out of where it was clicked with a turn, then the ring is dealt in.
  useLayoutEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    frontRef.current?.querySelector<HTMLElement>("[data-close]")?.focus({ preventScroll: true });

    // fromTo everywhere (explicit end values) + revert on cleanup, so a re-run never
    // captures a half-faded state as its target.
    const ctx = gsap.context(() => {
      gsap.fromTo(backdropRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45 });
      if (calm()) return;
      const from = fromOrigin();
      const tl = gsap.timeline();
      if (from) {
        tl.fromTo(
          sceneRef.current,
          { ...from, rotationY: -spin * 28, rotationZ: -spin * 4, transformPerspective: 1600 },
          { x: 0, y: 0, scaleX: 1, scaleY: 1, rotationY: 0, rotationZ: 0, duration: 0.9, ease: "expo.out" },
        );
      } else {
        tl.fromTo(
          sceneRef.current,
          { y: 160, rotationX: -40, rotationY: spin * 14, scale: 0.8, autoAlpha: 0, transformPerspective: 1600 },
          { y: 0, rotationX: 0, rotationY: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "back.out(1.3)" },
        );
      }
      // The ring tips up into place; the header slides down.
      tl.fromTo(
        frontRef.current!.querySelector("[data-ring]"),
        { y: 90, rotationX: -65 },
        { y: 0, rotationX: 0, duration: 0.9, ease: "back.out(1.4)" },
        0.3,
      ).fromTo(
        frontRef.current!.querySelectorAll("[data-chrome]"),
        { y: -14, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05 },
        0.4,
      );
    });
    return () => {
      ctx.revert();
      document.body.style.overflow = "";
      prevFocus?.focus?.({ preventScroll: true });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once on open
  }, []);

  // Close: back into the box it came from (if we're still on that view), else tossed away.
  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (calm()) return onClose();
    const to = !flipped && idx === start ? fromOrigin() : null;
    gsap.to(backdropRef.current, { autoAlpha: 0, duration: 0.45, ease: "power2.in" });
    if (to) {
      gsap.to(sceneRef.current, {
        ...to,
        rotationY: spin * 20,
        rotationZ: spin * 3,
        duration: 0.55,
        ease: "power3.in",
        onComplete: onClose,
      });
    } else {
      gsap.to(sceneRef.current, {
        y: 120,
        rotationX: 30,
        rotationZ: -spin * 8,
        scale: 0.8,
        autoAlpha: 0,
        transformPerspective: 1600,
        duration: 0.45,
        ease: "power2.in",
        onComplete: onClose,
      });
    }
  }, [onClose, flipped, idx, start, fromOrigin, spin]);

  // Flip like a playing card: lift and shrink a little on the way over, then settle.
  const flip = useCallback(() => {
    if (flipping.current) return;
    const next = !flipped;
    flipping.current = true;
    setFlipped(next);
    if (next) frontRef.current?.querySelectorAll("video").forEach((v) => v.pause());
    const card = cardRef.current!;
    const done = () => {
      flipping.current = false;
      (next ? backRef : frontRef).current?.querySelector<HTMLElement>("[data-flip]")?.focus({ preventScroll: true });
    };
    if (calm()) {
      gsap.set(card, { rotationY: next ? 180 : 0 });
      return done();
    }
    gsap
      .timeline({ onComplete: done })
      .to(card, { rotationY: next ? spin * 180 : 0, duration: 0.95, ease: "power3.inOut" }, 0)
      .to(card, { scale: 0.86, z: 80, rotationZ: next ? spin * -4 : spin * 4, duration: 0.47, ease: "power2.out" }, 0)
      .to(card, { scale: 1, z: 0, rotationZ: 0, duration: 0.48, ease: "power2.in" }, 0.47)
      // a glare sweeps across mid-turn
      .fromTo(
        card.querySelectorAll("[data-glare]"),
        { xPercent: -120 * spin, autoAlpha: 0 },
        { xPercent: 120 * spin, autoAlpha: 1, duration: 0.8, ease: "power2.inOut" },
        0.05,
      );
  }, [flipped, spin]);

  const goTo = useCallback(
    (next: number, dir: number) => {
      setIdx(next);
      gsap.fromTo(
        stageRef.current,
        { autoAlpha: 0, x: Math.sign(dir) * (isRTL ? -50 : 50), scale: 0.97 },
        { autoAlpha: 1, x: 0, scale: 1, duration: 0.5, ease: "power3.out" },
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (!flipped && e.key === "ArrowRight") step(isRTL ? -1 : 1);
      if (!flipped && e.key === "ArrowLeft") step(isRTL ? 1 : -1);
      if (e.key === "Tab") {
        // Trap focus inside the face that is showing
        const face = (flipped ? backRef : frontRef).current;
        if (!face) return;
        const f = face.querySelectorAll<HTMLElement>(FOCUSABLE);
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
  }, [close, step, isRTL, flipped]);

  const faceBase =
    "absolute inset-0 flex flex-col overflow-hidden rounded-[26px] border shadow-[0_40px_120px_-30px_rgba(0,0,0,0.85)] [backface-visibility:hidden]";
  const glare = (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[inherit]">
      <div
        data-glare
        className="invisible absolute inset-y-0 left-0 w-full"
        style={{ background: "linear-gradient(100deg,transparent 30%,rgba(255,255,255,0.14) 48%,rgba(147,194,219,0.18) 52%,transparent 70%)" }}
      />
    </div>
  );
  const closeBtn = (
    <button
      data-close
      type="button"
      onClick={close}
      aria-label={t("projects.close")}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/15 text-white/70 transition hover:border-[#71aecf] hover:text-[#93c2db]"
    >
      <Icon name="close" size={20} />
    </button>
  );

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-2 sm:p-4 md:p-6"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div ref={backdropRef} aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[#05060f]/85 backdrop-blur-md" />

      <div ref={sceneRef} className="pointer-events-none relative h-[min(94svh,820px)] w-full max-w-5xl" style={{ perspective: 2200 }}>
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="pm-title"
          className="pointer-events-auto relative h-full w-full"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* FRONT: media only */}
          <section ref={frontRef} inert={flipped} className={`${faceBase} border-white/10 bg-[#05060f] text-white`}>
            {glare}
            <header className="flex items-center gap-3 px-4 pb-3 pt-4 md:px-6">
              <div data-chrome className="flex min-w-0 flex-1 items-center gap-3">
                <span className="chip shrink-0 !bg-white/10 !text-white">{t(`projects.filters.${project.category}`)}</span>
                <h2 id="pm-title" className="m-0 truncate text-base font-bold md:text-lg">
                  {l(project.title)}
                </h2>
              </div>
              <button
                data-chrome
                data-flip
                type="button"
                onClick={flip}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl bg-[#4e9bc4] px-3 text-sm font-medium text-[#0d1024] transition hover:bg-[#71aecf] sm:px-4"
              >
                <Icon name="flip" size={17} />
                <span className="max-sm:sr-only">{t("projects.flipDetails")}</span>
              </button>
              <span data-chrome>{closeBtn}</span>
            </header>

            {/* Current media */}
            <div className="relative mx-3 min-h-0 flex-1 overflow-hidden rounded-2xl bg-black md:mx-5">
              <div ref={stageRef} className="absolute inset-0">
                <MediaFrame key={current?.src ?? "none"} media={current} title={l(project.title)} seed={seed} mode="full" />
              </div>
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
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/70 to-transparent px-4 pb-3 pt-10 text-sm">
                <span className="truncate text-white/85">{current?.caption ? l(current.caption) : media.length ? "" : t("projects.noMedia")}</span>
                <span dir="ltr" className="shrink-0 font-mono text-xs text-white/70">
                  {media.length ? `${idx + 1} / ${media.length}` : ""}
                </span>
              </div>
            </div>

            {/* The ring */}
            <div className="shrink-0 px-1 pb-3 pt-2">
              <MediaRing
                media={media}
                selected={idx}
                onSelect={(i) => i !== idx && goTo(i, i - idx)}
                title={l(project.title)}
                seed={seed}
              />
            </div>
          </section>

          {/* BACK: the written details */}
          <section
            ref={backRef}
            inert={!flipped}
            className={`${faceBase} grid-bg border-line bg-bg-2`}
            style={{ transform: "rotateY(180deg)" }}
          >
            {glare}
            <header className="flex items-start gap-3 border-b border-line px-5 py-4 md:px-8 md:py-5">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <span className="chip w-fit">{t(`projects.filters.${project.category}`)}</span>
                <h2 className="m-0 text-2xl font-black leading-snug md:text-3xl">{l(project.title)}</h2>
              </div>
              <button
                data-flip
                type="button"
                onClick={flip}
                className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-line-strong px-3 text-sm font-medium text-ink transition hover:border-accent hover:text-accent sm:px-4"
              >
                <Icon name="flip" size={17} />
                <span className="max-sm:sr-only">{t("projects.flipMedia")}</span>
              </button>
              <button
                type="button"
                onClick={close}
                aria-label={t("projects.close")}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:border-accent hover:text-accent"
              >
                <Icon name="close" size={20} />
              </button>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto px-5 py-6 md:grid md:grid-cols-[1.25fr_1fr] md:gap-10 md:px-8 md:py-8">
              <div className="flex flex-col gap-6">
                <p className="m-0 text-[15px] leading-8 text-muted md:text-base">{l(project.description)}</p>
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
              </div>

              <div className="flex flex-col gap-6">
                <dl className="m-0 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-line bg-surface/60 p-4">
                    <dt className="text-xs text-faint">{t("projects.role")}</dt>
                    <dd className="m-0 mt-1 text-sm font-medium">{l(project.role)}</dd>
                  </div>
                  <div className="rounded-xl border border-line bg-surface/60 p-4">
                    <dt className="text-xs text-faint">{t("projects.year")}</dt>
                    <dd dir="ltr" className="m-0 mt-1 text-sm font-medium rtl:text-right">
                      {project.year}
                    </dd>
                  </div>
                </dl>
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
                  <div className="flex flex-wrap gap-3">
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
          </section>
        </div>
      </div>
    </div>,
    document.body,
  );
}
