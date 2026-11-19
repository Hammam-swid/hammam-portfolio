import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { useAsync } from "../../hooks/useAsync";
import { ProjectsService } from "../../services/data";
import { gsap, useGSAP } from "../../lib/gsap";
import SectionHeading from "../fx/SectionHeading";
import ProjectCard from "../projects/ProjectCard";
import ProjectModal from "../projects/ProjectModal";
import Magnetic from "../fx/Magnetic";
import Icon from "../fx/Icon";

/**
 * Desktop: the section pins and vertical scrolling slides the cards sideways.
 * Mobile / reduced motion: a swipeable snap row.
 */
export default function FeaturedProjects() {
  const { t, lang, isRTL } = useLang();
  const { data: projects } = useAsync(ProjectsService.getFeatured);
  const [open, setOpen] = useState<{ p: Project; i: number } | null>(null);
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!projects?.length) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const distance = () => Math.max(0, el.scrollWidth - el.clientWidth);
        const tween = gsap.to(el.children, {
          x: () => (isRTL ? 1 : -1) * distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance() + window.innerHeight * 0.4}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
        // Cards lean slightly as they travel
        gsap.utils.toArray<HTMLElement>("[data-slide]").forEach((card) => {
          gsap.fromTo(
            card,
            { rotate: isRTL ? 2.5 : -2.5, scale: 0.94 },
            {
              rotate: 0,
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: isRTL ? "right 0%" : "left 100%",
                end: isRTL ? "right 60%" : "left 40%",
                scrub: true,
              },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [projects, lang], revertOnUpdate: true },
  );

  return (
    <section ref={section} id="work" className="relative flex min-h-[100svh] flex-col justify-center gap-12 overflow-hidden py-24 lg:gap-8 lg:py-12">
      <div className="container-x flex flex-wrap items-end justify-between gap-6">
        <SectionHeading label={t("projects.label")} title={t("projects.title")} subtitle={t("projects.subtitle")} />
        <Magnetic>
          <Link to="/projects" className="btn btn-ghost">
            {t("projects.allProjects")}
            <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
          </Link>
        </Magnetic>
      </div>

      <div
        ref={track}
        className="container-x flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 lg:snap-none lg:overflow-visible [scrollbar-width:none]"
      >
        {projects?.map((p, i) => (
          <div key={p.id} data-slide className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[34vw] lg:max-w-[460px]">
            <ProjectCard project={p} index={i} compact onOpen={(pr) => setOpen({ p: pr, i })} />
          </div>
        ))}
        <div data-slide className="flex w-[70%] shrink-0 snap-start sm:w-[40%] lg:w-[26%]">
          <Link
            to="/projects"
            className="spot group flex w-full flex-col items-center justify-center gap-4 p-10 text-center"
          >
            <span className="grid h-20 w-20 place-items-center rounded-full border border-line-strong text-accent transition-transform duration-500 group-hover:rotate-[-45deg] rtl:group-hover:rotate-[45deg]">
              <Icon name="arrow" size={30} className="rtl:-scale-x-100" />
            </span>
            <span className="text-xl font-bold">{t("projects.allProjects")}</span>
          </Link>
        </div>
      </div>

      <div className="container-x hidden lg:block" aria-hidden="true">
        <div className="h-[2px] w-full overflow-hidden rounded bg-line">
          <div ref={bar} className="h-full origin-left bg-accent rtl:origin-right" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>

      {open && <ProjectModal project={open.p} seed={open.i} onClose={() => setOpen(null)} />}
    </section>
  );
}
