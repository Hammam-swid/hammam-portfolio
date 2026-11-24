import { useEffect, useRef } from "react";

interface Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number; // base alpha
  glow: number; // 0..1, lights up near the cursor and fades back
  tw: number; // twinkle phase
}

const PUSH_RADIUS = 150;

/**
 * Canvas background of randomly scattered dots that drift on their own.
 * The cursor pushes nearby dots away and makes them light up; they then
 * settle and keep drifting. Fills its (relative) parent. Pauses offscreen.
 */
export default function DotField({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dots: Dot[] = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999, on: false };
    let rgb = "113,174,207";

    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(v);
      if (m) rgb = `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`;
    };

    const seed = () => {
      const n = Math.round(Math.min(420, ((w * h) / 2600) * density));
      dots = Array.from({ length: n }, () => {
        const ang = Math.random() * Math.PI * 2;
        const sp = 0.08 + Math.random() * 0.22;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 0.05, // a slight upward drift overall
          r: 0.6 + Math.random() ** 2 * 1.8,
          a: 0.18 + Math.random() * 0.35,
          glow: 0,
          tw: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const first = !w;
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (first) seed();
      if (calm) draw(0);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const twinkle = 0.75 + 0.25 * Math.sin(t * 0.0012 + d.tw);
        const alpha = Math.min(1, d.a * twinkle + d.glow * 0.75);
        const r = d.r * (1 + d.glow * 0.9);
        if (d.glow > 0.05) {
          ctx.fillStyle = `rgba(${rgb},${d.glow * 0.18})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${rgb},${alpha})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (t: number) => {
      for (const d of dots) {
        if (mouse.on) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < PUSH_RADIUS && dist > 0.5) {
            const k = 1 - dist / PUSH_RADIUS;
            // push away from the cursor, harder the closer it is
            d.vx += (dx / dist) * k * 0.55;
            d.vy += (dy / dist) * k * 0.55;
            d.glow = Math.max(d.glow, k);
          }
        }
        // ease back toward a gentle drift speed
        const sp = Math.hypot(d.vx, d.vy);
        const target = 0.18;
        if (sp > target) {
          d.vx *= 0.94;
          d.vy *= 0.94;
        }
        d.glow *= 0.965;
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < -10) d.x = w + 10;
        else if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10;
        else if (d.y > h + 10) d.y = -10;
      }
      draw(t);
      raf = requestAnimationFrame(step);
    };

    const start = () => {
      if (calm || raf || !visible || document.hidden) return;
      raf = requestAnimationFrame(step);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.on = mouse.x >= -50 && mouse.x <= r.width + 50 && mouse.y >= -50 && mouse.y <= r.height + 50;
    };
    const onLeave = () => (mouse.on = false);
    const onVis = () => (document.hidden ? stop() : start());

    readColor();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const mo = new MutationObserver(() => {
      readColor();
      if (calm) draw(0);
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [density]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
}
