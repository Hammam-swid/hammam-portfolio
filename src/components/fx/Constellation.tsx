import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface ConstellationHandle {
  /** 0 = resting, 1 = particles pushed fully outward (driven by scroll). */
  scatter: (progress: number) => void;
}

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const LINK = 120;
const PULL_RADIUS = 180;

/**
 * Canvas particle network: drifting points joined by fading lines,
 * gently drawn toward the pointer. Pauses when offscreen or hidden.
 */
const Constellation = forwardRef<ConstellationHandle, { className?: string }>(function Constellation(
  { className = "" },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scatterRef = useRef(0);

  useImperativeHandle(ref, () => ({ scatter: (p) => (scatterRef.current = p) }), []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let parts: P[] = [];
    let raf = 0;
    let visible = true;
    const mouse = { x: -9999, y: -9999, on: false };
    let color = "113,174,207";

    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(v);
      if (m) color = `${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)}`;
    };

    const seed = () => {
      const count = Math.round(Math.min(80, Math.max(26, (w * h) / 16000)));
      parts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1 + Math.random() * 1.6,
      }));
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const first = !w;
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (first || parts.length === 0) seed();
      if (calm) draw();
    };

    const draw = () => {
      const s = scatterRef.current;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // Scattered positions push away from the center as the hero scrolls out
      const pos = parts.map((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        return { x: p.x + dx * s * 1.4, y: p.y + dy * s * 1.4 - s * 80 };
      });
      const fade = 1 - s * 0.85;

      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x;
          const dy = pos[i].y - pos[j].y;
          const d = Math.hypot(dx, dy);
          if (d > LINK) continue;
          let a = (1 - d / LINK) * 0.35;
          if (mouse.on) {
            const md = Math.hypot((pos[i].x + pos[j].x) / 2 - mouse.x, (pos[i].y + pos[j].y) / 2 - mouse.y);
            if (md < PULL_RADIUS) a += (1 - md / PULL_RADIUS) * 0.45;
          }
          ctx.strokeStyle = `rgba(${color},${a * fade})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(pos[i].x, pos[i].y);
          ctx.lineTo(pos[j].x, pos[j].y);
          ctx.stroke();
        }
      }
      for (let i = 0; i < pos.length; i++) {
        ctx.fillStyle = `rgba(${color},${0.75 * fade})`;
        ctx.beginPath();
        ctx.arc(pos[i].x, pos[i].y, parts[i].r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = () => {
      for (const p of parts) {
        if (mouse.on) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < PULL_RADIUS && d > 1) {
            const f = (1 - d / PULL_RADIUS) * 0.035;
            p.vx += (dx / d) * f;
            p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        // keep a minimum drift so the field never freezes
        const sp = Math.hypot(p.vx, p.vy);
        if (sp < 0.12) {
          p.vx += (Math.random() - 0.5) * 0.02;
          p.vy += (Math.random() - 0.5) * 0.02;
        }
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }
      draw();
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
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.on = e.pointerType === "mouse" && mouse.y >= 0 && mouse.y <= r.height;
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
      if (calm) draw();
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
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none ${className}`} />;
});

export default Constellation;
