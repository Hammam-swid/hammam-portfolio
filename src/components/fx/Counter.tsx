import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "../../lib/gsap";

/** Counts up from 0 to `to` the first time it scrolls into view. */
export default function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = ref.current!;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const obj = { v: 0 };
      el.textContent = `0${suffix}`;
      ScrollTrigger.create({
        trigger: el,
        start: "top 90%",
        once: true,
        onEnter: () =>
          gsap.to(obj, {
            v: to,
            duration: 1.6,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = `${Math.round(obj.v)}${suffix}`;
            },
          }),
      });
    },
    { scope: ref, dependencies: [to] },
  );

  return (
    <span ref={ref} dir="ltr">
      {to}
      {suffix}
    </span>
  );
}
