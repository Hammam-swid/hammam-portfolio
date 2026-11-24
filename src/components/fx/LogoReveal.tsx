import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../../hooks/useLang";
import { gsap } from "../../lib/gsap";
import { LOGO_CENTERLINES, LOGO_VIEWBOX, logoFor } from "../../lib/logo";
import Letters from "./Letters";

/**
 * Full-screen intro for the projects page.
 *  1. A thin line traces the logo's real outline while a spark leads the way.
 *  2. Just behind it, a thick "paint" stroke runs along the logo's path,
 *     clipped to the exact shape, so the mark fills in along its own curve.
 *  3. The solid mark settles, glows, and the page title rises underneath.
 *  4. The logo zooms through the screen and a growing hole reveals the page.
 * Click, scroll or press a key to hurry it along.
 */
export default function LogoReveal({ onReveal }: { onReveal: () => void }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [logo] = useState(() => logoFor(document.documentElement.dataset.theme === "light" ? "light" : "dark"));

  useLayoutEffect(() => {
    if (done) {
      onReveal();
      return;
    }
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    let revealed = false;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      onReveal();
    };
    const finish = () => {
      html.style.overflow = prevOverflow;
      reveal();
      setDone(true);
    };

    const ctx = gsap.context(() => {
      const main = root.current!.querySelector<SVGPathElement>("[data-paint='0']")!;
      const tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, onComplete: finish });
      tl.fromTo("[data-ghost]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
        // 1. outline traces the real edge
        .fromTo("[data-outline]", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.5, ease: "power1.inOut" }, 0.1)
        // 2. paint follows the path, a spark at its tip
        .fromTo(main, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.35 }, 0.35)
        // spark appears only once it starts riding (not parked at 0,0 beforehand)
        .to("[data-spark]", { motionPath: { path: main, align: main, alignOrigin: [0.5, 0.5] }, duration: 1.35 }, 0.35)
        .set("[data-spark]", { autoAlpha: 1 }, 0.36)
        .fromTo("[data-paint='1']", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.45, ease: "power2.out" }, 1.45)
        .fromTo(
          "[data-dot]",
          { scale: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.5, stagger: 0.12, ease: "back.out(2.5)" },
          1.5,
        )
        .to("[data-spark]", { scale: 3, autoAlpha: 0, duration: 0.35, ease: "power2.out" }, 1.7)
        // 3. solid mark settles in, outline fades, glow + title
        .fromTo("[data-solid]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power1.out" }, 1.75)
        .to("[data-outline]", { autoAlpha: 0, duration: 0.4 }, 1.8)
        .fromTo("[data-glow]", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.4, ease: "power2.out" }, 1.8)
        .fromTo("[data-logo]", { scale: 1 }, { scale: 1.06, duration: 0.3, yoyo: true, repeat: 1 }, 1.8)
        .fromTo(
          "[data-reveal-title] [data-letter]",
          { yPercent: 120, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: "power3.out" },
          1.75,
        )
        // 4. exit: title drops, logo zooms through, a hole opens from the center
        .to("[data-reveal-title] [data-letter]", { yPercent: -120, autoAlpha: 0, duration: 0.35, stagger: 0.02, ease: "power2.in" }, 2.55)
        .to("[data-logo]", { scale: 9, autoAlpha: 0, duration: 0.95, ease: "expo.in" }, 2.65)
        .call(reveal, [], 3.2)
        .fromTo(root.current, { "--hole": "0vmax" }, { "--hole": "150vmax", duration: 0.9, ease: "expo.in" }, 2.9);

      // Any input hurries the intro along
      const hurry = () => tl.timeScale(3.5);
      window.addEventListener("pointerdown", hurry);
      window.addEventListener("keydown", hurry);
      window.addEventListener("wheel", hurry, { passive: true });
      window.addEventListener("touchmove", hurry, { passive: true });
      return () => {
        window.removeEventListener("pointerdown", hurry);
        window.removeEventListener("keydown", hurry);
        window.removeEventListener("wheel", hurry);
        window.removeEventListener("touchmove", hurry);
      };
    }, root);

    return () => {
      ctx.revert();
      html.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- plays once per visit
  }, []);

  if (done) return null;

  const [c0, c1, c2] = logo.ink;
  const shapes = logo.shapes.map((d) => <path key={d} d={d} />);

  return createPortal(
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[95] grid place-items-center"
      style={{
        // a growing transparent hole in the middle reveals the page underneath
        maskImage: "radial-gradient(circle at 50% 46%, transparent var(--hole, 0vmax), #000 calc(var(--hole, 0vmax) + 1px))",
        WebkitMaskImage: "radial-gradient(circle at 50% 46%, transparent var(--hole, 0vmax), #000 calc(var(--hole, 0vmax) + 1px))",
      }}
    >
      <div className="grid-bg noise absolute inset-0 bg-bg">
        <div
          className="absolute left-1/2 top-[46%] h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
        />
      </div>

      <div className="relative flex flex-col items-center gap-8">
        <div data-logo className="relative w-[min(36vmin,240px)]">
          <svg viewBox={LOGO_VIEWBOX} className="block h-auto w-full overflow-visible">
            <defs>
              {/* the logo's own gradient, laid diagonally across the mark */}
              <linearGradient id="lr-ink" x1="-74.695" y1="67.115" x2="88.441" y2="-51.078" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor={c0} />
                <stop offset="0.634" stopColor={c1} />
                <stop offset="1" stopColor={c2} />
              </linearGradient>
              <clipPath id="lr-shape">{shapes}</clipPath>
              <filter id="lr-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" />
              </filter>
            </defs>

            {/* faint guide of the whole mark */}
            <g data-ghost fill="var(--border-strong)" fillOpacity={0.22}>
              {shapes}
            </g>
            {/* glow, faded in once drawn */}
            <g data-glow fill={logo.outline} opacity={0} filter="url(#lr-glow)">
              {shapes}
            </g>
            {/* paint along the path, clipped to the exact shape */}
            <g clipPath="url(#lr-shape)" fill="none" stroke="url(#lr-ink)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round">
              {LOGO_CENTERLINES.map((d, i) => (
                <path key={d} data-paint={i} d={d} />
              ))}
            </g>
            {logo.dots.map((c) => (
              <circle key={c.cx} data-dot cx={c.cx} cy={c.cy} r={c.r} fill="url(#lr-ink)" />
            ))}
            {/* the finished mark */}
            <g data-solid fill="url(#lr-ink)" opacity={0}>
              {shapes}
            </g>
            {/* the outline being traced */}
            <g fill="none" stroke={logo.outline} strokeWidth={0.7} strokeLinecap="round" strokeLinejoin="round">
              {logo.shapes.map((d) => (
                <path key={d} data-outline d={d} />
              ))}
            </g>
          </svg>
          <span
            data-spark
            className="invisible absolute left-0 top-0 h-4 w-4 rounded-full bg-white shadow-[0_0_0_5px_var(--tint),0_0_30px_10px_var(--glow)]"
          />
        </div>
        <div data-reveal-title key={lang} className="overflow-hidden px-4 pb-2 text-4xl font-black tracking-tight rtl:tracking-normal md:text-6xl">
          <Letters text={t("projects.pageTitle")} gradient />
        </div>
      </div>
    </div>,
    document.body,
  );
}
