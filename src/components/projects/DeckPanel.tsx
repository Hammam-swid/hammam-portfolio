import { useRef, useState } from "react";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap, useGSAP, MOTION_OK } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import Icon from "../fx/Icon";

/**
 * One project in the stacked deck: details on one side and a single large
 * image on the other. Hovering plays the project's video over the image.
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
  onOpen: (p: Project, origin: DOMRect | undefined) => void;
}) {
  const { t, l, lang } = useLang();
  const root = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLButtonElement>(null);
  const [hover, setHover] = useState(false);

  const media = project.media;
  const still = media.find((m) => m.src === project.cover) ?? media.find((m) => m.type === "image") ?? media[0];
  const video = media.find((m) => m.type === "video");
  const open = () => onOpen(project, mediaRef.current?.getBoundingClientRect());

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
        });
        gsap.from("[data-shot]", {
          clipPath: "inset(12% 12% 12% 12% round 24px)",
          scale: 1.15,
          duration: 1.3,
          ease: "expo.out",
          clearProps: "clipPath",
          scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [lang] },
  );

  return (
    <article
      ref={root}
      data-panel
      className="sticky top-[calc(140px+var(--i)*8px)] lg:top-[calc(152px+var(--i)*14px)]"
      style={{ "--i": index } as React.CSSProperties}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
    >
      <div
        data-panel-inner
        className="spot relative origin-top overflow-hidden lg:h-[min(560px,calc(100svh-190px))] lg:min-h-[460px]"
      >
        {/* Darkens as the next panel slides over this one */}
        <div data-shade aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 bg-[#05060f] opacity-0" />
        <div className="flex h-full flex-col gap-4 p-4 sm:gap-6 md:p-8 lg:grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.45fr)] lg:gap-10 lg:p-10">
          {/* Details */}
          <div className="order-2 flex min-w-0 flex-col gap-3 sm:gap-4 lg:order-none lg:justify-center">
            <div data-rise className="flex items-center gap-3">
              <span
                dir="ltr"
                className="font-mono text-4xl font-black leading-none text-transparent md:text-6xl"
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
            <h2 data-rise className="m-0 text-2xl font-black leading-tight sm:text-3xl md:text-4xl">
              {l(project.title)}
            </h2>
            <p data-rise className="m-0 line-clamp-2 text-[15px] leading-7 text-muted sm:line-clamp-3">
              {l(project.tagline)}
            </p>
            <p data-rise className="m-0 hidden text-sm text-faint sm:block">
              {l(project.role)}
            </p>
            <div data-rise dir="ltr" className="flex flex-wrap gap-2 rtl:justify-end">
              {project.technologies.slice(0, 6).map((tech, i) => (
                <span key={tech} className={`chip ${i > 3 ? "max-sm:hidden" : ""}`}>
                  {tech}
                </span>
              ))}
            </div>
            <div data-rise className="flex flex-wrap items-center gap-2 sm:pt-1">
              <button type="button" className="btn btn-primary" onClick={open}>
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
          </div>

          {/* One large image; the video takes over on hover */}
          <button
            ref={mediaRef}
            type="button"
            onClick={open}
            aria-label={`${t("projects.details")}: ${l(project.title)}`}
            className="group/m order-1 relative block aspect-[16/10] w-full min-w-0 shrink-0 overflow-hidden rounded-2xl sm:aspect-video lg:order-none border border-line bg-[#05060f] shadow-[var(--shadow)] lg:aspect-auto lg:h-full"
          >
            <div data-shot className="absolute inset-0">
              <div className="h-full w-full transition-transform duration-[1.2s] ease-out group-hover/m:scale-[1.04]">
                <MediaFrame media={still} title={l(project.title)} seed={seed} />
              </div>
              {video && hover && (
                <div className="absolute inset-0 animate-[fade-in_600ms_ease-out_both]">
                  <MediaFrame media={video} title={l(project.title)} seed={seed} active />
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-[#05060f]/80 to-transparent p-4 pt-12 text-sm text-white">
              <span className="inline-flex items-center gap-2">
                <Icon name="image" size={15} />
                <span dir="ltr">{media.length}</span>
                {video && (
                  <span className="ms-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs backdrop-blur [@media(hover:none)]:hidden">
                    <Icon name="play" size={10} /> {t("projects.hoverPlay")}
                  </span>
                )}
              </span>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/15 backdrop-blur transition-transform duration-300 group-hover/m:-rotate-45 rtl:group-hover/m:rotate-45">
                <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
              </span>
            </div>
          </button>
        </div>
      </div>
    </article>
  );
}
