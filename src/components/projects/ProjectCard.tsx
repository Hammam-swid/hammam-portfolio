import { useRef, useState } from "react";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap, useGSAP } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import Icon from "../fx/Icon";

const HOVER_OK = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/**
 * Project card with 3D tilt, spotlight border and hover video preview.
 * On hover a detail drawer (tagline + highlights) rises over the media
 * without changing the card's size, so the grid never reflows.
 */
export default function ProjectCard({
  project,
  index,
  onOpen,
  size = "md",
  wide = false,
  compact = false,
}: {
  project: Project;
  index: number;
  /** `origin` is the card's media box, so the modal can grow out of it. */
  onOpen: (p: Project, origin?: DOMRect) => void;
  size?: "md" | "lg";
  wide?: boolean;
  /** featured row: shorter card that fits a pinned viewport */
  compact?: boolean;
}) {
  const { t, l, lang } = useLang();
  const ref = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [hover, setHover] = useState(false);

  const videos = project.media.filter((m) => m.type === "video").length;
  const images = project.media.length - videos;
  const preview = project.media.find((m) => m.type === "video") ?? project.media[0];
  const highlights = l(project.highlights).slice(0, compact ? 2 : 3);

  // Expand timeline (desktop pointers only). Played on hover/focus, reversed on leave.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(HOVER_OK, () => {
        const q = gsap.utils.selector(ref);
        tl.current = gsap
          .timeline({ paused: true, defaults: { ease: "power3.out" } })
          .to(q("[data-zoom]"), { scale: 1.08, yPercent: -6, duration: 0.7 }, 0)
          .fromTo(q("[data-shade]"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, 0)
          .fromTo(
            q("[data-drawer]"),
            { clipPath: "inset(100% 0% 0% 0%)", yPercent: 18 },
            { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0, duration: 0.55 },
            0.05,
          )
          .fromTo(q("[data-hl]"), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.06 }, 0.2)
          .fromTo(q("[data-chip]"), { y: 0 }, { y: -3, duration: 0.25, stagger: 0.03, yoyo: true, repeat: 1 }, 0.1);
        return () => {
          tl.current = null;
        };
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [lang, compact], revertOnUpdate: true },
  );

  const expand = () => tl.current?.timeScale(1).play();
  const collapse = () => tl.current?.timeScale(1.6).reverse();

  const tilt = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(el, { rotateY: px * 8, rotateX: -py * 8, duration: 0.5, ease: "power3.out", transformPerspective: 1000 });
  };
  const reset = () => {
    setHover(false);
    collapse();
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "elastic.out(1,0.5)" });
  };

  return (
    <article
      ref={ref}
      data-id={project.id}
      onPointerMove={tilt}
      onPointerEnter={() => {
        setHover(true);
        expand();
      }}
      onPointerLeave={reset}
      onFocus={expand}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && collapse()}
      className="spot group flex h-full flex-col overflow-hidden [transform-style:preserve-3d]"
    >
      <div
        ref={mediaRef}
        className={`relative overflow-hidden rounded-t-[19px] ${wide ? "aspect-[16/10] md:aspect-[24/9]" : compact ? "aspect-video" : "aspect-[16/10]"}`}
      >
        <div data-zoom className="h-full w-full origin-bottom">
          <MediaFrame media={hover ? preview : project.media[0]} title={l(project.title)} seed={index} active={hover} />
        </div>
        <div
          data-shade
          aria-hidden="true"
          className="invisible absolute inset-0 bg-gradient-to-t from-[#05060f]/90 via-[#05060f]/45 to-transparent"
        />

        {/* Detail drawer: hidden until hover on desktop */}
        <div
          data-drawer
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden flex-col gap-2 p-4 text-white [clip-path:inset(100%_0_0_0)] md:p-5 [@media(hover:hover)_and_(pointer:fine)]:flex motion-reduce:!hidden"
        >
          <p data-hl className="m-0 line-clamp-2 text-sm font-medium leading-6 text-white/95">
            {l(project.tagline)}
          </p>
          <ul className="m-0 flex list-none flex-col gap-1 p-0">
            {highlights.map((h) => (
              <li key={h} data-hl className="flex gap-2 text-[13px] leading-5 text-white/75">
                <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#71aecf]" />
                <span className="line-clamp-1">{h}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
          <span className="chip !bg-[#0d1024]/70 !text-white backdrop-blur">{t(`projects.filters.${project.category}`)}</span>
          <span className="flex gap-1.5">
            {images > 0 && (
              <span className="chip !bg-[#0d1024]/70 !text-white backdrop-blur" dir="ltr">
                <Icon name="image" size={13} /> {images}
              </span>
            )}
            {videos > 0 && (
              <span className="chip !bg-[#0d1024]/70 !text-white backdrop-blur" dir="ltr">
                <Icon name="play" size={11} /> {videos}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className={`flex flex-1 flex-col gap-3 ${compact ? "p-5" : "p-6"}`}>
        <div className="flex items-center justify-between gap-3 text-sm text-faint">
          <span>{l(project.role)}</span>
          <span dir="ltr" className="font-mono">{project.year}</span>
        </div>
        <h3 className="m-0 text-xl font-bold leading-snug md:text-2xl">
          <button
            type="button"
            onClick={() => onOpen(project, mediaRef.current?.getBoundingClientRect())}
            className="text-start after:absolute after:inset-0 after:z-[3] after:content-[''] focus-visible:outline-none focus-visible:after:rounded-[20px] focus-visible:after:outline focus-visible:after:outline-3 focus-visible:after:outline-accent"
          >
            {l(project.title)}
          </button>
        </h3>
        {!compact && <p className="m-0 line-clamp-2 text-[15px] leading-7 text-muted">{l(project.tagline)}</p>}
        <div dir="ltr" className="mt-auto flex flex-wrap gap-2 pt-2 rtl:justify-end">
          {project.technologies.slice(0, compact ? 4 : size === "lg" ? 8 : 5).map((tech) => (
            <span key={tech} data-chip className="chip">
              {tech}
            </span>
          ))}
        </div>
        <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-accent">
          {t("projects.details")}
          <Icon name="arrow" size={16} className="transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
        </span>
      </div>
    </article>
  );
}
