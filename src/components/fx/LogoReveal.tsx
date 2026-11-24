import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLang } from "../../hooks/useLang";
import { gsap } from "../../lib/gsap";
import { HOOK_JUNCTION_FROM_END, LOGO_HOOK, LOGO_MAIN, LOGO_SIZE, logoFor } from "../../lib/logo";
import Letters from "./Letters";
import DotField from "./DotField";

const COMET = 190; // length of the glowing line, in screen px
const RUN = 3.6; // seconds for the line to travel in → through the logo → out

/** Screen layout: where the logo sits and the entry/exit swoops around it. */
function layout(W: number, H: number) {
  const L = Math.min(Math.min(W, H) * 0.36, 240); // logo width in px
  const s = L / LOGO_SIZE.w;
  const cx = W / 2;
  const cy = H * 0.45;
  const ox = cx - (LOGO_SIZE.w * s) / 2;
  const oy = cy - (LOGO_SIZE.h * s) / 2;
  const at = (x: number, y: number) => ({ x: ox + x * s, y: oy + y * s });
  const start = at(5.9, 103.9); // where the main stroke begins (heading right)
  const end = at(6.1, 77.6); // where it ends (heading left)
  const R = L * 0.95;
  const f = (n: number) => n.toFixed(1);

  // In from the left edge, along the bottom of a circle around the logo,
  // up the right side, over the top, down the left, then into the stroke's start.
  const entry = [
    `M -80 ${f(cy + R * 0.55)}`,
    `C ${f(cx * 0.45)} ${f(cy + R * 0.55)} ${f(cx - R * 0.9)} ${f(cy + R)} ${f(cx)} ${f(cy + R)}`,
    `A ${f(R)} ${f(R)} 0 0 0 ${f(cx)} ${f(cy - R)}`,
    `A ${f(R)} ${f(R)} 0 0 0 ${f(cx - R)} ${f(cy)}`,
    `C ${f(cx - R)} ${f(cy + (start.y - cy) * 0.9)} ${f(start.x - (start.x - (cx - R)) * 0.6)} ${f(start.y)} ${f(start.x)} ${f(start.y)}`,
  ].join(" ");

  // Out of the stroke's end (heading left), under the logo, and off the right edge.
  const exit = [
    `M ${f(end.x)} ${f(end.y)}`,
    `C ${f(end.x - L * 0.5)} ${f(end.y)} ${f(cx - R * 0.8)} ${f(cy + R * 1.05)} ${f(cx)} ${f(cy + R * 1.05)}`,
    `C ${f(cx + R * 0.9)} ${f(cy + R * 1.05)} ${f(W * 0.82)} ${f(cy - R * 0.25)} ${f(W + 80)} ${f(cy - R * 0.5)}`,
  ].join(" ");

  return { W, H, L, s, cx, cy, ox, oy, entry, exit, titleTop: oy + LOGO_SIZE.h * s + 36 };
}

/**
 * Full-screen intro for the projects page.
 *  1. A glowing line streaks in from the edge of the screen, sweeps around the
 *     middle in a circle and flows straight into the logo's stroke.
 *  2. It draws the logo, painting the mark in behind it (clipped to the real
 *     shape); where the middle bar meets the hook, a branch splits off.
 *  3. The line leaves the logo, swoops under it and out the other side.
 *  4. The mark settles and glows, the title rises, then it zooms through the
 *     screen and a growing hole reveals the page.
 * Click, scroll or press a key to hurry it along.
 */
export default function LogoReveal({ onReveal }: { onReveal: () => void }) {
  const { t, lang } = useLang();
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [logo] = useState(() => logoFor(document.documentElement.dataset.theme === "light" ? "light" : "dark"));
  const [g] = useState(() => layout(window.innerWidth, window.innerHeight));

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
      const q = <T extends Element>(sel: string) => root.current!.querySelector<T>(sel)!;
      const entry = q<SVGPathElement>("[data-entry]");
      const exit = q<SVGPathElement>("[data-exit]");
      const mainLine = q<SVGPathElement>("[data-line='main']");
      const hookLine = q<SVGPathElement>("[data-line='hook']");
      const mainPaint = q<SVGPathElement>("[data-paint='main']");
      const hookPaint = q<SVGPathElement>("[data-paint='hook']");
      const spark = q<SVGCircleElement>("[data-spark]");
      const dots = gsap.utils.toArray<SVGCircleElement>("[data-dot]", root.current);

      const lenIn = entry.getTotalLength();
      const lenOut = exit.getTotalLength();
      const lenMain = mainLine.getTotalLength(); // logo units
      const lenHook = hookLine.getTotalLength();
      const junction = lenMain - HOOK_JUNCTION_FROM_END;
      const comet = COMET / g.s; // comet length in logo units
      const total = lenIn + lenMain * g.s + lenOut + COMET;

      // Where along the main stroke each dot sits, so it pops as the line passes.
      const dotAt = dots.map((d) => {
        const cx = Number(d.getAttribute("cx"));
        const cy = Number(d.getAttribute("cy"));
        let best = 0;
        let bestD = Infinity;
        for (let i = 0; i <= 300; i++) {
          const p = mainLine.getPointAtLength((lenMain * i) / 300);
          const dd = (p.x - cx) ** 2 + (p.y - cy) ** 2;
          if (dd < bestD) {
            bestD = dd;
            best = (lenMain * i) / 300;
          }
        }
        return best;
      });
      const popped = dots.map(() => false);

      // Show the window [a, b] of a path as a stroke; hide it when empty.
      const win = (el: SVGPathElement, len: number, a: number, b: number) => {
        const lo = Math.max(0, a);
        const hi = Math.min(len, b);
        if (hi <= lo) {
          el.style.visibility = "hidden";
          return;
        }
        el.style.visibility = "visible";
        el.style.strokeDasharray = `${hi - lo} ${len * 2 + 10}`;
        el.style.strokeDashoffset = `${-lo}`;
      };

      let solid = false;
      const draw = (sPx: number) => {
        // 1) entry swoop
        win(entry, lenIn, sPx - COMET, sPx);
        // 2) through the logo (logo units)
        const sl = (sPx - lenIn) / g.s;
        win(mainLine, lenMain, sl - comet, sl);
        win(mainPaint, lenMain, 0, sl);
        const h = sl - junction; // the hook grows from the junction at the same speed
        win(hookLine, lenHook, h - comet, h);
        win(hookPaint, lenHook, 0, h);
        dots.forEach((d, i) => {
          if (!popped[i] && sl >= dotAt[i]) {
            popped[i] = true;
            // grow the radius (exact, unlike scaling an SVG shape around a zero-size box)
            gsap.fromTo(d, { attr: { r: 0 } }, { attr: { r: Number(d.dataset.r) }, duration: 0.55, ease: "back.out(2.6)" });
          }
        });
        // 3) out the other side
        const se = sPx - lenIn - lenMain * g.s;
        win(exit, lenOut, se - COMET, se);

        // spark at the head
        let p: { x: number; y: number } | null = null;
        if (sPx <= lenIn) p = entry.getPointAtLength(Math.max(0, sPx));
        else if (sl <= lenMain) {
          const lp = mainLine.getPointAtLength(sl);
          p = { x: g.ox + lp.x * g.s, y: g.oy + lp.y * g.s };
        } else if (se <= lenOut) p = exit.getPointAtLength(se);
        if (p) {
          spark.setAttribute("cx", String(p.x));
          spark.setAttribute("cy", String(p.y));
        }
        spark.style.visibility = p ? "visible" : "hidden";

        // once the stroke and hook are fully painted, the solid mark settles in
        if (!solid && sl >= lenMain && h >= lenHook) {
          solid = true;
          gsap.to("[data-solid]", { autoAlpha: 1, duration: 0.45, ease: "power1.out" });
          gsap.fromTo("[data-glow]", { autoAlpha: 0 }, { autoAlpha: 0.9, duration: 0.5, ease: "power2.out" });
        }
      };
      draw(0);

      const head = { s: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(head, { s: total, duration: RUN, ease: "sine.inOut", onUpdate: () => draw(head.s) }, 0.1)
        .fromTo(
          "[data-reveal-title] [data-letter]",
          { yPercent: 120, autoAlpha: 0 },
          { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.04, ease: "power3.out" },
          RUN - 0.6,
        )
        // exit: title drops, logo zooms through, a hole opens from the center
        .to("[data-reveal-title] [data-letter]", { yPercent: -120, autoAlpha: 0, duration: 0.35, stagger: 0.02, ease: "power2.in" }, RUN + 0.55)
        .to("[data-zoom]", { scale: 9, autoAlpha: 0, duration: 0.95, ease: "expo.in", svgOrigin: `${g.cx} ${g.cy}` }, RUN + 0.65)
        .call(reveal, [], RUN + 1.2)
        .fromTo(root.current, { "--hole": "0vmax" }, { "--hole": "150vmax", duration: 0.9, ease: "expo.in" }, RUN + 0.9);

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
  const holeAt = `circle at 50% ${((g.cy / g.H) * 100).toFixed(1)}%`;

  return createPortal(
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[95]"
      style={{
        // a growing transparent hole at the logo reveals the page underneath
        maskImage: `radial-gradient(${holeAt}, transparent var(--hole, 0vmax), #000 calc(var(--hole, 0vmax) + 1px))`,
        WebkitMaskImage: `radial-gradient(${holeAt}, transparent var(--hole, 0vmax), #000 calc(var(--hole, 0vmax) + 1px))`,
      }}
    >
      <div className="noise absolute inset-0 bg-bg">
        <DotField />
        <div
          className="absolute h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{ left: g.cx, top: g.cy, background: "radial-gradient(circle, var(--glow), transparent 70%)" }}
        />
      </div>

      <svg viewBox={`0 0 ${g.W} ${g.H}`} className="absolute inset-0 h-full w-full overflow-visible">
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
          <filter id="lr-comet" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g data-zoom>
          {/* the traveling line outside the logo */}
          <g fill="none" stroke={logo.outline} strokeWidth={3} strokeLinecap="round" filter="url(#lr-comet)">
            <path data-entry d={g.entry} style={{ visibility: "hidden" }} />
            <path data-exit d={g.exit} style={{ visibility: "hidden" }} />
          </g>

          <g transform={`translate(${g.ox} ${g.oy}) scale(${g.s})`}>
            {/* glow, faded in once drawn */}
            <g data-glow fill={logo.outline} opacity={0} filter="url(#lr-glow)">
              {shapes}
            </g>
            {/* paint behind the line, clipped to the exact shape */}
            <g clipPath="url(#lr-shape)" fill="none" stroke="url(#lr-ink)" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round">
              <path data-paint="main" d={LOGO_MAIN} style={{ visibility: "hidden" }} />
              <path data-paint="hook" d={LOGO_HOOK} style={{ visibility: "hidden" }} />
            </g>
            {logo.dots.map((c) => (
              <circle key={c.cx} data-dot data-r={c.r} cx={c.cx} cy={c.cy} r={0} fill="url(#lr-ink)" />
            ))}
            <g data-solid fill="url(#lr-ink)" opacity={0}>
              {shapes}
            </g>
            {/* the line itself while it draws the logo */}
            <g fill="none" stroke={logo.outline} strokeWidth={3 / g.s} strokeLinecap="round" filter="url(#lr-comet)">
              <path data-line="main" d={LOGO_MAIN} style={{ visibility: "hidden" }} />
              <path data-line="hook" d={LOGO_HOOK} style={{ visibility: "hidden" }} />
            </g>
          </g>

          {/* bright head of the line */}
          <circle
            data-spark
            r={5}
            fill="#fff"
            style={{ visibility: "hidden", filter: "drop-shadow(0 0 8px var(--glow)) drop-shadow(0 0 3px #fff)" }}
          />
        </g>
      </svg>

      <div
        data-reveal-title
        key={lang}
        className="absolute inset-x-0 flex justify-center overflow-hidden px-4 pb-2 text-4xl font-black tracking-tight rtl:tracking-normal md:text-6xl"
        style={{ top: g.titleTop }}
      >
        <Letters text={t("projects.pageTitle")} gradient />
      </div>
    </div>,
    document.body,
  );
}
