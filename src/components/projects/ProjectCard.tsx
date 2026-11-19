import { useRef, useState } from "react";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import Icon from "../fx/Icon";

/** Project card with 3D tilt, spotlight border and hover video preview. */
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
  onOpen: (p: Project) => void;
  size?: "md" | "lg";
  wide?: boolean;
  /** featured row: shorter card that fits a pinned viewport */
  compact?: boolean;
}) {
  const { t, l } = useLang();
  const ref = useRef<HTMLElement>(null);
  const [hover, setHover] = useState(false);

  const videos = project.media.filter((m) => m.type === "video").length;
  const images = project.media.length - videos;
  const preview = project.media.find((m) => m.type === "video") ?? project.media[0];

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
    gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.7, ease: "elastic.out(1,0.5)" });
  };

  return (
    <article
      ref={ref}
      data-id={project.id}
      onPointerMove={tilt}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={reset}
      className="spot group flex h-full flex-col overflow-hidden [transform-style:preserve-3d]"
    >
      <div className={`relative overflow-hidden rounded-t-[19px] ${wide ? "aspect-[16/10] md:aspect-[24/9]" : compact ? "aspect-video" : "aspect-[16/10]"}`}>
        <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.05]">
          <MediaFrame media={hover ? preview : project.media[0]} title={l(project.title)} seed={index} active={hover} />
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
            onClick={() => onOpen(project)}
            className="text-start after:absolute after:inset-0 after:z-[3] after:content-[''] focus-visible:outline-none focus-visible:after:rounded-[20px] focus-visible:after:outline focus-visible:after:outline-3 focus-visible:after:outline-accent"
          >
            {l(project.title)}
          </button>
        </h3>
        {!compact && <p className="m-0 line-clamp-2 text-[15px] leading-7 text-muted">{l(project.tagline)}</p>}
        <div dir="ltr" className="mt-auto flex flex-wrap gap-2 pt-2 rtl:justify-end">
          {project.technologies.slice(0, compact ? 4 : size === "lg" ? 8 : 5).map((tech) => (
            <span key={tech} className="chip">
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
