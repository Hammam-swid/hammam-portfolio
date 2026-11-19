import { useRef } from "react";
import { useLang } from "../../hooks/useLang";
import { useAsync } from "../../hooks/useAsync";
import { ExperiencesService } from "../../services/data";
import { formatMonth } from "../../lib/format";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "../../lib/gsap";
import SectionHeading from "../fx/SectionHeading";
import Reveal from "../fx/Reveal";

export default function Experience() {
  const { t, l, lang, isRTL } = useLang();
  const { data: items } = useAsync(ExperiencesService.getAll);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      if (!items) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // The line fills as you scroll through the timeline
        gsap.fromTo(
          "[data-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: list.current, start: "top 65%", end: "bottom 65%", scrub: 0.5 },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-item]").forEach((item) => {
          const dot = item.querySelector("[data-dot]");
          ScrollTrigger.create({
            trigger: item,
            start: "top 65%",
            onEnter: () => dot?.classList.add("is-on"),
            onLeaveBack: () => dot?.classList.remove("is-on"),
          });
          gsap.from(item.querySelector("[data-body]"), {
            x: isRTL ? -60 : 60,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 80%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: list, dependencies: [items, lang], revertOnUpdate: true },
  );

  const period = (s?: string, e?: string, kind?: string) => {
    if (kind === "education" && !s && e) return `${t("experience.graduated")} · ${formatMonth(e, lang)}`;
    const a = s ? formatMonth(s, lang) : "";
    const b = e ? formatMonth(e, lang) : t("experience.present");
    return `${a} — ${b}`;
  };

  return (
    <Reveal as="section" id="experience" className="relative py-24 md:py-32">
      <div className="container-x grid gap-14 lg:grid-cols-[1fr_2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <SectionHeading label={t("experience.label")} title={t("experience.title")} subtitle={t("experience.subtitle")} />
        </div>

        <ol ref={list} className="relative m-0 flex list-none flex-col gap-10 p-0 ps-10 md:ps-14">
          <span aria-hidden="true" className="absolute bottom-2 start-[11px] top-2 w-[2px] rounded bg-line md:start-[15px]" />
          <span data-line aria-hidden="true" className="absolute bottom-2 start-[11px] top-2 w-[2px] origin-top rounded md:start-[15px]" style={{ background: "linear-gradient(to bottom,#71aecf,#2b87b8,#222a60)" }} />

          {items?.map((x) => {
            const current = !x.endDate;
            return (
              <li key={x.id} data-item className="relative">
                <span
                  data-dot
                  aria-hidden="true"
                  className="absolute -start-10 top-7 grid h-6 w-6 place-items-center rounded-full border-2 border-line-strong bg-bg transition-all duration-500 md:-start-14 md:h-8 md:w-8 [&.is-on]:scale-110 [&.is-on]:border-accent [&.is-on]:shadow-[0_0_0_6px_var(--tint)]"
                >
                  <span className="h-2 w-2 rounded-full bg-accent md:h-2.5 md:w-2.5" />
                </span>
                <article data-body className="spot flex flex-col gap-4 p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-accent">{t(`experience.kinds.${x.kind}`)}</span>
                      <h3 className="m-0 text-xl font-bold md:text-2xl">{l(x.position)}</h3>
                      <p className="m-0 font-medium text-muted">
                        {l(x.company)}
                        {x.location && <span className="text-faint"> · {l(x.location)}</span>}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                        current ? "bg-primary text-on-primary" : "border border-line-strong text-ink"
                      }`}
                    >
                      {current && <span className="me-2 inline-block h-2 w-2 animate-pulse rounded-full bg-current align-middle" />}
                      {period(x.startDate, x.endDate, x.kind)}
                    </span>
                  </div>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {l(x.bullets).map((b) => (
                      <li key={b} className="flex gap-3 text-[15px] leading-7 text-muted">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div dir="ltr" className="flex flex-wrap gap-2 rtl:justify-end">
                    {x.technologies.map((tech) => (
                      <span key={tech} className="chip">
                        {tech}
                      </span>
                    ))}
                  </div>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </Reveal>
  );
}
