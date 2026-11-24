import { useLayoutEffect, useRef, useState } from "react";
import { useLang } from "../../hooks/useLang";
import { useAsync } from "../../hooks/useAsync";
import { ExperiencesService } from "../../services/data";
import { formatMonth } from "../../lib/format";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "../../lib/gsap";
import { buildJourney, buildRoad } from "../../lib/journeyPath";
import SectionHeading from "../fx/SectionHeading";
import Reveal from "../fx/Reveal";

interface Geo {
  w: number;
  h: number;
  d: string;
  /** where each milestone sits along the path, 0..1 */
  at: number[];
  /** which side each card enters from, -1 = left, 1 = right */
  from: number[];
}

const TRAIL = [0.9, 1.3, 1.8];

/**
 * A journey: one line snakes left and right down the timeline, drawing
 * itself as you scroll, with a glowing traveler at its tip. Each milestone
 * lights up as the traveler reaches it and its card slides in.
 */
export default function Experience() {
  const { t, l, lang } = useLang();
  const { data: items } = useAsync(ExperiencesService.getAll);
  const list = useRef<HTMLOListElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  // Cards already revealed stay revealed when the path is rebuilt (resize, fonts, language).
  const revealed = useRef(new Set<string>());

  // Measure the milestones and build the path; rebuild whenever the layout changes.
  useLayoutEffect(() => {
    const ol = list.current;
    if (!ol || !items?.length) return;
    let last = "";
    const measure = () => {
      const box = ol.getBoundingClientRect();
      if (!box.width) return;
      const wide = window.matchMedia("(min-width: 1024px)").matches;
      const lis = Array.from(ol.querySelectorAll<HTMLElement>("[data-item]"));
      const points = lis.map((li) => {
        const r = li.querySelector("[data-dot]")!.getBoundingClientRect();
        return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
      });
      // offset* ignores the cards' slide-in transforms
      const cards = lis.map((li) => li.querySelector<HTMLElement>("[data-body]")!);
      const cardSide = cards.map((c) => {
        const mid = c.offsetLeft + c.offsetWidth / 2;
        return Math.sign(mid - box.width / 2) || 1;
      });
      // Desktop: bulge into the free half beside each card.
      // Phone: run down the strip beside each card, swoop across between them.
      const { d, prefixes } = wide
        ? buildJourney(points, cardSide.map((s) => -s), { amp: box.width * 0.34, startY: 0, endY: box.height })
        : buildRoad(
            points,
            points.map((p, i) => ({ x: p.x, y: lis[i].offsetTop + cards[i].offsetTop + cards[i].offsetHeight - 18 })),
            box.height,
          );

      const key = `${Math.round(box.width)}x${Math.round(box.height)}|${d}`;
      if (key === last) return;
      last = key;

      // Measure each milestone's distance along the path with a scratch path.
      const svg = svgRef.current!;
      const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
      svg.appendChild(probe);
      probe.setAttribute("d", d);
      const total = probe.getTotalLength() || 1;
      const at = prefixes.map((p) => {
        probe.setAttribute("d", p);
        return probe.getTotalLength() / total;
      });
      probe.remove();

      setGeo({ w: box.width, h: box.height, d, at, from: cardSide });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ol);
    return () => ro.disconnect();
  }, [items, lang]);

  useGSAP(
    () => {
      if (!geo) return;
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const q = gsap.utils.selector(list);
        const path = list.current!.querySelector<SVGPathElement>("[data-path]")!;
        const lis = q("[data-item]") as HTMLElement[];
        const done = revealed.current;
        const id = (i: number) => lis[i].dataset.item!;

        lis.forEach((li, i) => {
          if (done.has(id(i))) {
            li.querySelector("[data-dot]")?.classList.add("is-on");
            return;
          }
          gsap.set(li.querySelector("[data-body]"), { autoAlpha: 0, x: geo.from[i] * 60, rotate: geo.from[i] * 3 });
        });
        gsap.set(q("[data-traveler]"), { autoAlpha: 1 });

        const reveal = (i: number) => {
          if (done.has(id(i))) return;
          done.add(id(i));
          const li = lis[i];
          gsap.to(li.querySelector("[data-body]"), { autoAlpha: 1, x: 0, rotate: 0, duration: 1, ease: "expo.out" });
          gsap.fromTo(
            li.querySelectorAll("[data-pop]"),
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.05, delay: 0.15, ease: "power3.out" },
          );
          const date = li.querySelector<HTMLElement>("[data-date]");
          if (date && lang === "en") {
            // Lock the width so scrambling never re-wraps the card
            gsap.set(date, { width: date.offsetWidth, display: "inline-block", whiteSpace: "nowrap" });
            gsap.to(date, {
              duration: 1.1,
              scrambleText: { text: date.dataset.date!, chars: "0123456789", speed: 0.5 },
              onComplete: () => {
                gsap.set(date, { clearProps: "width,display,whiteSpace" });
              },
            });
          }
        };

        const range = { trigger: list.current, start: "top 62%", end: "bottom 62%" };
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { ...range, scrub: 0.6 },
          onUpdate: () => {
            const p = tl.progress();
            lis.forEach((li, i) => {
              const on = p >= geo.at[i] - 0.002;
              li.querySelector("[data-dot]")?.classList.toggle("is-on", on || done.has(id(i)));
              if (on) reveal(i);
            });
          },
        });
        const ride = { path, align: path, alignOrigin: [0.5, 0.5] };
        tl.fromTo(path, { drawSVG: "0%" }, { drawSVG: "100%" }, 0).to(q("[data-traveler='head']"), { motionPath: ride }, 0);

        // Backup: a card also shows once it is well into view, even if the line lags behind.
        lis.forEach((li, i) => {
          ScrollTrigger.create({ trigger: li, start: "top 55%", once: true, onEnter: () => reveal(i) });
        });

        // Comet trail: the same ride with looser smoothing, so it lags behind the head.
        q("[data-traveler='trail']").forEach((el, i) => {
          gsap.to(el, { motionPath: ride, ease: "none", scrollTrigger: { ...range, scrub: TRAIL[i] } });
        });
      });
      return () => mm.revert();
    },
    { scope: list, dependencies: [geo, lang], revertOnUpdate: true },
  );

  const period = (s?: string, e?: string, kind?: string) => {
    if (kind === "education" && !s && e) return `${t("experience.graduated")} · ${formatMonth(e, lang)}`;
    const a = s ? formatMonth(s, lang) : "";
    const b = e ? formatMonth(e, lang) : t("experience.present");
    return `${a} — ${b}`;
  };

  return (
    <Reveal as="section" id="experience" className="relative overflow-x-clip py-24 md:py-32">
      <div className="container-x">
        <SectionHeading label={t("experience.label")} title={t("experience.title")} subtitle={t("experience.subtitle")} />

        <ol ref={list} className="relative m-0 mt-14 flex list-none flex-col gap-16 p-0 md:mt-20 md:gap-20 lg:gap-16">
          {/* The journey line */}
          <svg
            ref={svgRef}
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 overflow-visible"
            width={geo?.w ?? 0}
            height={geo?.h ?? 0}
            viewBox={`0 0 ${geo?.w ?? 1} ${geo?.h ?? 1}`}
          >
            <defs>
              <linearGradient id="journey-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#71aecf" />
                <stop offset="55%" stopColor="#2b87b8" />
                <stop offset="100%" stopColor="#24487d" />
              </linearGradient>
            </defs>
            {geo && (
              <>
                <path d={geo.d} fill="none" stroke="var(--border-strong)" strokeOpacity={0.7} strokeWidth={2} strokeDasharray="2 9" strokeLinecap="round" />
                <path
                  data-path
                  d={geo.d}
                  fill="none"
                  stroke="url(#journey-grad)"
                  strokeWidth={3}
                  strokeLinecap="round"
                  style={{ filter: "drop-shadow(0 0 6px var(--glow))" }}
                />
              </>
            )}
          </svg>

          {/* Traveler at the tip of the line, with a fading trail */}
          {TRAIL.map((_, i) => (
            <span
              key={i}
              data-traveler="trail"
              aria-hidden="true"
              className="pointer-events-none invisible absolute left-0 top-0 z-[5] rounded-full bg-accent"
              style={{ width: 10 - i * 2, height: 10 - i * 2, opacity: 0.45 - i * 0.12 }}
            />
          ))}
          <span
            data-traveler="head"
            aria-hidden="true"
            className="pointer-events-none invisible absolute left-0 top-0 z-[6] h-4 w-4 rounded-full bg-white shadow-[0_0_0_4px_var(--tint),0_0_24px_6px_var(--glow)]"
          />

          {items?.map((x, i) => {
            const current = !x.endDate;
            const date = period(x.startDate, x.endDate, x.kind);
            return (
              <li key={x.id} data-item={x.id} className="relative z-[2] lg:grid lg:grid-cols-2 lg:gap-32">
                <span
                  data-dot
                  aria-hidden="true"
                  className={`absolute top-7 z-[4] grid h-6 w-6 place-items-center rounded-full border-2 border-line-strong bg-bg transition-all duration-500 lg:start-1/2 lg:end-auto lg:-ms-4 lg:h-8 lg:w-8 [&.is-on]:scale-125 [&.is-on]:border-accent [&.is-on]:shadow-[0_0_0_7px_var(--tint)] ${
                    i % 2 ? "end-[9px]" : "start-[9px]"
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-accent lg:h-2.5 lg:w-2.5" />
                </span>
                {/* Phones: cards alternate edges, leaving a strip for the line on the other side */}
                <article
                  data-body
                  className={`spot flex flex-col gap-4 p-5 md:p-8 lg:mx-0 ${i % 2 ? "me-11 lg:col-start-2" : "ms-11 lg:col-start-1"}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <span data-pop className="text-sm font-medium text-accent">
                        {t(`experience.kinds.${x.kind}`)}
                      </span>
                      <h3 data-pop className="m-0 text-xl font-bold md:text-2xl">
                        {l(x.position)}
                      </h3>
                      <p data-pop className="m-0 font-medium text-muted">
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
                      <span key={`${lang}-${date}`} data-date={date}>{date}</span>
                    </span>
                  </div>
                  <ul className="m-0 flex list-none flex-col gap-2 p-0">
                    {l(x.bullets).map((b) => (
                      <li key={b} data-pop className="flex gap-3 text-[15px] leading-7 text-muted">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <div dir="ltr" className="flex flex-wrap gap-2 rtl:justify-end">
                    {x.technologies.map((tech) => (
                      <span key={tech} data-pop className="chip">
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
