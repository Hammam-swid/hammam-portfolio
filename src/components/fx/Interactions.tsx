import { useEffect, useRef } from "react";
import { gsap } from "../../lib/gsap";

/**
 * Global pointer effects, mounted once:
 *  - a soft glow that trails the cursor (fine pointers only)
 *  - spotlight borders on any `.spot` card (sets --mx / --my)
 *  - click ripples on any `.btn`
 *  - a thin scroll-progress bar at the top of the page
 */
export default function Interactions() {
  const glowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const glow = glowRef.current!;

    const toX = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3" });
    const toY = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3" });

    const onMove = (e: PointerEvent) => {
      if (fine && !calm) {
        toX(e.clientX);
        toY(e.clientY);
        glow.style.opacity = "1";
      }
      const card = (e.target as Element | null)?.closest?.<HTMLElement>(".spot");
      if (card) {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      }
    };
    const onLeave = () => (glow.style.opacity = "0");

    const onDown = (e: PointerEvent) => {
      const btn = (e.target as Element | null)?.closest?.<HTMLElement>(".btn");
      if (!btn || calm) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const dot = document.createElement("span");
      dot.className = "ripple";
      dot.style.width = dot.style.height = `${size}px`;
      dot.style.left = `${e.clientX - r.left - size / 2}px`;
      dot.style.top = `${e.clientY - r.top - size / 2}px`;
      btn.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove());
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <>
      <div
        ref={barRef}
        aria-hidden="true"
        className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left rtl:origin-right"
        style={{ background: "var(--brand-gradient)", transform: "scaleX(0)" }}
      />
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-0 h-[520px] w-[520px] rounded-full opacity-0 transition-opacity duration-500"
        style={{
          background: "radial-gradient(circle, var(--glow) 0%, transparent 65%)",
          filter: "blur(20px)",
          marginLeft: -260,
          marginTop: -260,
        }}
      />
    </>
  );
}
