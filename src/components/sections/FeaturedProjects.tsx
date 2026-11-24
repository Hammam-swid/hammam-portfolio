import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Project } from "../../types";
import { useLang } from "../../hooks/useLang";
import { useAsync } from "../../hooks/useAsync";
import { ProjectsService } from "../../services/data";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "../../lib/gsap";
import SectionHeading from "../fx/SectionHeading";
import ProjectModal from "../projects/ProjectModal";
import MediaFrame from "../projects/MediaFrame";
import Magnetic from "../fx/Magnetic";
import Icon from "../fx/Icon";

/** Poster card: the image fills the card; hovering plays the video. */
function FanCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project, origin: DOMRect) => void;
}) {
  const { t, l } = useLang();
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  const still = project.media.find((m) => m.src === project.cover) ?? project.media.find((m) => m.type === "image");
  const video = project.media.find((m) => m.type === "video");

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => onOpen(project, ref.current!.getBoundingClientRect())}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      className="group relative block h-full w-full overflow-hidden rounded-[22px] border border-white/10 bg-[#05060f] text-start text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
    >
      <div className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-110">
        <MediaFrame media={still} title={l(project.title)} seed={index} />
      </div>
      {video && hover && (
        <div className="absolute inset-0 animate-[fade-in_500ms_ease-out_both]">
          <MediaFrame media={video} title={l(project.title)} seed={index} active />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#05060f]/95 via-[#05060f]/35 via-45% to-transparent" />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <span dir="ltr" className="font-mono text-3xl font-black leading-none text-transparent" style={{ WebkitTextStroke: "1px rgba(240,241,242,0.8)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="chip !bg-[#0d1024]/70 !text-white backdrop-blur">{t(`projects.filters.${project.category}`)}</span>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-5">
        <span className="text-xs text-white/60">
          {l(project.role)} · <span dir="ltr">{project.year}</span>
        </span>
        <span className="text-xl font-bold leading-snug md:text-2xl">{l(project.title)}</span>
        {/* Tagline slides up on hover */}
        <span className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-out group-hover:grid-rows-[1fr]">
          <span className="overflow-hidden">
            <span className="line-clamp-3 block pt-1 text-sm leading-6 text-white/75">{l(project.tagline)}</span>
          </span>
        </span>
        <span dir="ltr" className="mt-1 flex flex-wrap gap-1.5 rtl:justify-end">
          {project.technologies.slice(0, 3).map((tech) => (
            <span key={tech} className="rounded-full bg-white/12 px-2.5 py-0.5 text-[11px] backdrop-blur">
              {tech}
            </span>
          ))}
        </span>
      </div>
    </button>
  );
}

/**
 * Featured work as a hand of cards. Scrolling in deals the stack and then
 * fans it open (pinned on desktop); hovering lifts a card out of the fan.
 */
export default function FeaturedProjects() {
  const { t, lang, isRTL } = useLang();
  const { data: projects } = useAsync(ProjectsService.getFeatured);
  const [open, setOpen] = useState<{ p: Project; i: number; origin?: DOMRect } | null>(null);
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!projects?.length) return;
      const cards = gsap.utils.toArray<HTMLElement>("[data-fan]");
      const n = cards.length;
      const mid = (n - 1) / 2;
      const dir = isRTL ? -1 : 1;

      // Open-fan pose for card i, sized to fit the stage width.
      const spread = () => {
        const w = cards[0].offsetWidth;
        const room = stage.current!.offsetWidth - w - 24;
        return Math.min(w * 0.8, room / Math.max(1, n - 1));
      };
      const wide = () => window.innerWidth >= 1024;
      const pose = {
        x: (i: number) => dir * (i - mid) * spread(),
        y: (i: number) => (i - mid) ** 2 * (wide() ? 22 : 12),
        rotate: (i: number) => dir * (i - mid) * (wide() ? 8 : 6),
      };

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(cards, { ...pose, transformOrigin: "50% 100%" });
      });

      // Deal: the stack rises in with a messy, hand-held look, then fans open.
      const deal = () => {
        gsap.set(cards, { transformOrigin: "50% 100%" });
        return gsap
          .timeline({ paused: true, defaults: { ease: "power3.inOut" } })
          .from(cards, {
            y: 420,
            rotate: () => gsap.utils.random(-25, 25),
            autoAlpha: 0,
            duration: 1,
            stagger: 0.12,
            ease: "power3.out",
          })
          .to(cards, { rotate: () => gsap.utils.random(-3, 3), duration: 0.3 }, "-=0.2")
          .to(cards, { ...pose, duration: 1.2, stagger: { each: 0.05, from: "center" } }, ">-0.05");
      };

      // Lift card k out of the hand (straightened) and nudge its neighbours aside.
      const lift = (k: number | null, rise = 44, nudge = 36, center = false) => {
        cards.forEach((c, i) => {
          const off = k === null || i === k ? 0 : Math.sign(i - k) * dir * nudge;
          gsap.to(c.firstElementChild, {
            // phones: pull the front card to the middle of the hand
            x: center && i === k ? -Number(gsap.getProperty(c, "x")) : off,
            y: i === k ? -rise : 0,
            scale: i === k ? 1.05 : 1,
            rotate: i === k ? -Number(gsap.getProperty(c, "rotate")) : 0,
            duration: 0.55,
            ease: "power3.out",
            overwrite: true,
          });
          c.style.zIndex = i === k ? "50" : String(i + 1);
        });
      };

      // Desktop hover
      const hoverLift = () => {
        const offs = cards.map((c, i) => {
          const on = () => lift(i);
          const off = () => lift(null);
          c.addEventListener("pointerenter", on);
          c.addEventListener("pointerleave", off);
          return () => {
            c.removeEventListener("pointerenter", on);
            c.removeEventListener("pointerleave", off);
          };
        });
        return () => offs.forEach((f) => f());
      };

      // Desktop: pin the section and let scrolling deal and fan the hand.
      mm.add(`(min-width: 1024px) and ${MOTION_OK}`, () => {
        const tl = deal();
        gsap.to(tl, {
          progress: 1,
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: "+=110%",
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
        return hoverLift();
      });
      // Phones/tablets: play it once when the hand comes into view.
      mm.add(`(max-width: 1023px) and ${MOTION_OK}`, () => {
        const tl = deal();
        // Touch: the front card is lifted; swipe or tap another card to bring it forward,
        // tap the front card to open it.
        let active = 0;
        const setActive = (k: number) => {
          active = (k + n) % n;
          lift(active, 24, 10, true);
        };
        tl.eventCallback("onComplete", () => setActive(0));
        ScrollTrigger.create({ trigger: stage.current, start: "top 75%", once: true, onEnter: () => tl.play() });

        const el = stage.current!;
        let x0: number | null = null;
        let swiped = false;
        const down = (e: PointerEvent) => {
          x0 = e.clientX;
          swiped = false;
        };
        const move = (e: PointerEvent) => {
          if (x0 === null || swiped) return;
          const dx = e.clientX - x0;
          if (Math.abs(dx) > 40) {
            swiped = true;
            setActive(active + (dx < 0 ? 1 : -1) * dir);
          }
        };
        const up = () => (x0 = null);
        const noDrag = (e: Event) => e.preventDefault();
        const clicks = cards.map((c, i) => {
          const onClick = (e: Event) => {
            if (swiped || i !== active) {
              e.preventDefault();
              e.stopPropagation();
              if (!swiped) setActive(i);
            }
          };
          c.addEventListener("click", onClick, true);
          return () => c.removeEventListener("click", onClick, true);
        });
        el.addEventListener("pointerdown", down);
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerup", up);
        el.addEventListener("pointercancel", up);
        el.addEventListener("dragstart", noDrag);
        return () => {
          el.removeEventListener("pointerdown", down);
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerup", up);
          el.removeEventListener("pointercancel", up);
          el.removeEventListener("dragstart", noDrag);
          clicks.forEach((f) => f());
        };
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [projects, lang], revertOnUpdate: true },
  );

  const cardSize = "w-[min(58vw,250px)] md:w-[260px] lg:w-[min(22vw,300px)]";

  return (
    <section ref={section} id="work" className="relative flex min-h-[100svh] flex-col justify-center gap-10 overflow-hidden py-24 lg:py-12">
      <div className="container-x flex flex-wrap items-end justify-between gap-6">
        <SectionHeading label={t("projects.label")} title={t("projects.title")} subtitle={t("projects.subtitle")} />
        <Magnetic>
          <Link to="/projects" className="btn btn-ghost">
            {t("projects.allProjects")}
            <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
          </Link>
        </Magnetic>
      </div>

      <div ref={stage} className="container-x relative flex touch-pan-y justify-center pb-16 pt-10">
        <div className={`relative aspect-[3/4] ${cardSize}`}>
          {projects?.map((p, i) => (
            <div key={p.id} data-fan className="absolute inset-0" style={{ zIndex: i + 1 }}>
              <div className="h-full w-full">
                <FanCard project={p} index={i} onOpen={(pr, origin) => setOpen({ p: pr, i, origin })} />
              </div>
            </div>
          ))}
          {projects && (
            <div data-fan className="absolute inset-0" style={{ zIndex: projects.length + 1 }}>
              <div className="h-full w-full">
                <Link
                  to="/projects"
                  className="group flex h-full w-full flex-col items-center justify-center gap-5 rounded-[22px] border border-line-strong p-8 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
                  style={{ background: "var(--brand-gradient)" }}
                >
                  <span className="grid h-20 w-20 place-items-center rounded-full border border-white/30 text-white transition-transform duration-500 group-hover:rotate-[-45deg] rtl:group-hover:rotate-[45deg]">
                    <Icon name="arrow" size={30} className="rtl:-scale-x-100" />
                  </span>
                  <span className="text-xl font-bold text-white">{t("projects.allProjects")}</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {open && <ProjectModal project={open.p} seed={open.i} origin={open.origin} onClose={() => setOpen(null)} />}
    </section>
  );
}
