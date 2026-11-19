import { useRef, useState } from "react";
import { useLang } from "../../hooks/useLang";
import { useAsync } from "../../hooks/useAsync";
import { SkillsService } from "../../services/data";
import { gsap, useGSAP } from "../../lib/gsap";
import Reveal from "../fx/Reveal";
import SectionHeading from "../fx/SectionHeading";

export default function Skills() {
  const { t, l } = useLang();
  const { data: groups } = useAsync(SkillsService.getAll);
  const [active, setActive] = useState<string>("all");
  const board = useRef<HTMLDivElement>(null);

  // Pop the chips in whenever the selection changes
  useGSAP(
    () => {
      if (!groups || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        "[data-chip]",
        { autoAlpha: 0, y: 24, scale: 0.8, rotate: () => gsap.utils.random(-8, 8) },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotate: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          stagger: { each: 0.025, from: "random" },
        },
      );
    },
    { scope: board, dependencies: [active, groups] },
  );

  const shown = groups?.filter((g) => active === "all" || g.id === active) ?? [];

  return (
    <Reveal as="section" id="skills" className="relative bg-bg-2 py-24 md:py-32" deps={[groups]}>
      <div className="container-x flex flex-col gap-14">
        <SectionHeading label={t("skills.label")} title={t("skills.title")} subtitle={t("skills.subtitle")} />

        <div className="grid gap-8 lg:grid-cols-[minmax(260px,1fr)_2fr]">
          {/* Category index */}
          <div data-reveal role="group" aria-label={t("skills.title")} className="flex flex-col">
            {[{ id: "all", title: { en: t("skills.all"), ar: t("skills.all") }, skills: groups?.flatMap((g) => g.skills) ?? [] }, ...(groups ?? [])].map(
              (g, i) => {
                const on = active === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setActive(g.id)}
                    className={`group flex items-center gap-4 border-b border-line py-4 text-start transition-colors ${
                      on ? "text-ink" : "text-faint hover:text-ink"
                    }`}
                  >
                    <span dir="ltr" className={`font-mono text-xs transition-colors ${on ? "text-accent" : ""}`}>
                      0{i}
                    </span>
                    <span className={`flex-1 text-xl font-bold transition-transform duration-300 md:text-2xl ${on ? "translate-x-2 rtl:-translate-x-2" : "group-hover:translate-x-1 rtl:group-hover:-translate-x-1"}`}>
                      {l(g.title)}
                    </span>
                    <span
                      dir="ltr"
                      className={`grid h-8 min-w-8 place-items-center rounded-full px-2 text-xs font-bold transition-colors ${
                        on ? "bg-primary text-on-primary" : "bg-tint text-tint-ink"
                      }`}
                    >
                      {g.skills.length}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          {/* Board */}
          <div ref={board} data-reveal="1" className="spot flex min-h-[340px] flex-col gap-8 p-6 md:p-8" aria-live="polite">
            {shown.map((g) => (
              <div key={g.id} className="flex flex-col gap-4">
                {active === "all" && <h3 className="m-0 text-sm font-medium text-faint">{l(g.title)}</h3>}
                <ul dir="ltr" className="m-0 flex list-none flex-wrap gap-3 p-0 rtl:justify-end">
                  {g.skills.map((s) => (
                    <li
                      key={s.name}
                      data-chip
                      className="group/chip relative flex cursor-default items-center gap-2 rounded-xl border border-line bg-bg px-4 py-2.5 text-[15px] font-medium transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-accent hover:shadow-[0_10px_30px_-12px_var(--glow)]"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-accent transition-transform group-hover/chip:scale-150" />
                      {s.name}
                      {s.level && (
                        <span className="rounded-md bg-tint px-1.5 text-[11px] text-tint-ink">{l(s.level)}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Reveal>
  );
}
