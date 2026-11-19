import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger, MOTION_OK } from "../../lib/gsap";

const ROW_A = ["React", "TypeScript", "Node.js", "Express.js", "Redux Toolkit", "React Query", "Tailwind CSS", "shadcn/ui"];
const ROW_B = ["MySQL", "TypeORM", "MongoDB", "ASP.NET Core", "SQL Server", "Nest.js", "Docker", "Git"];

function Row({ items, outline }: { items: string[]; outline?: boolean }) {
  return (
    <div className="flex overflow-hidden" dir="ltr">
      <div data-row className="flex shrink-0 gap-10 pe-10 will-change-transform">
        {[...items, ...items, ...items, ...items].map((w, i) => (
          <span
            key={i}
            className={`flex items-center gap-10 whitespace-nowrap text-4xl font-black md:text-6xl ${
              outline ? "text-transparent [-webkit-text-stroke:1.5px_var(--border-strong)]" : "text-ink/90"
            }`}
          >
            {w}
            <span className="h-3 w-3 rotate-45 rounded-[3px] bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Two rows of tech names that drift in opposite directions.
 * Scrolling speeds them up and flips direction with scroll direction.
 */
export default function Marquee() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const rows = gsap.utils.toArray<HTMLElement>("[data-row]");
        const tweens = rows.map((row, i) =>
          gsap.fromTo(
            row,
            { xPercent: i % 2 ? -50 : 0 },
            { xPercent: i % 2 ? 0 : -50, duration: 40, ease: "none", repeat: -1 },
          ),
        );
        let reset: gsap.core.Tween | undefined;
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-8, 8, self.getVelocity() / 200);
            const dir = self.direction;
            tweens.forEach((tw) => tw.timeScale(dir * Math.max(1, Math.abs(v))));
            reset?.kill();
            reset = gsap.delayedCall(0.15, () =>
              tweens.forEach((tw) =>
                gsap.to(tw, { timeScale: dir, duration: 0.8, ease: "power2.out" }),
              ),
            );
          },
        });
        // Skew the band slightly while scrolling fast
        const skewTo = gsap.quickTo(root.current, "skewY", { duration: 0.5, ease: "power3" });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => skewTo(gsap.utils.clamp(-3, 3, self.getVelocity() / -600)),
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div aria-hidden="true" className="relative overflow-hidden border-y border-line bg-bg-2 py-8">
      <div ref={root} className="flex flex-col gap-6">
        <Row items={ROW_A} />
        <Row items={ROW_B} outline />
      </div>
    </div>
  );
}
