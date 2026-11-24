import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { ProjectMedia } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap, Draggable } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import Icon from "../fx/Icon";

export interface WheelHandle {
  /** Spin several turns and land on a random segment. */
  spin: () => void;
}

const MIN_SEGMENTS = 6;
const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Clip-path for one slice pointing up from the center, `a` degrees wide. */
function wedgePath(a: number) {
  const pts = ["50% 50%"];
  const steps = 12;
  for (let k = 0; k <= steps; k++) {
    const t = ((-a / 2 + (a * k) / steps) * Math.PI) / 180;
    // a hair past the rim so neighbouring slices never show a seam
    pts.push(`${(50 + 52 * Math.sin(t)).toFixed(2)}% ${(50 - 52 * Math.cos(t)).toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")})`;
}

/**
 * A prize wheel made of the project's media. Drag to fling it (it coasts
 * with inertia and snaps onto a slice), press the hub to spin to a random
 * slice, or click a slice to bring it round. A flap at `pointerAt`
 * (degrees clockwise from 12 o'clock) ticks on every peg it passes.
 */
const MediaWheel = forwardRef<
  WheelHandle,
  {
    media: ProjectMedia[];
    title: string;
    seed: number;
    pointerAt: number;
    /** media index under the pointer once the wheel stops */
    onSettle: (mediaIndex: number) => void;
    /** media index under the pointer while it moves */
    onTick?: (mediaIndex: number) => void;
    className?: string;
  }
>(function MediaWheel({ media, title, seed, pointerAt: P, onSettle, onTick, className = "" }, ref) {
  const { t } = useLang();
  const wheelRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLSpanElement>(null);
  const segIndex = useRef(0);
  const cb = useRef({ onSettle, onTick });
  useEffect(() => {
    cb.current = { onSettle, onTick };
  });

  // Few media? Repeat them so the wheel always has enough slices to feel like one.
  const segs = useMemo(() => {
    const n = media.length;
    const count = n === 0 ? MIN_SEGMENTS : n >= MIN_SEGMENTS ? n : n * Math.ceil(MIN_SEGMENTS / n);
    return Array.from({ length: count }, (_, i) => (n ? i % n : -1));
  }, [media]);
  const N = segs.length;
  const a = 360 / N;
  const clip = useMemo(() => wedgePath(a), [a]);
  const boxW = Math.min(100, 108 * Math.sin(((a / 2) * Math.PI) / 180));

  // All motion lives in refs/GSAP so React never fights the rotation.
  const api = useRef<{ spin: () => void; goTo: (k: number) => void; step: (d: number) => void }>(null);

  useEffect(() => {
    const wheel = wheelRef.current!;
    const rot = () => Number(gsap.getProperty(wheel, "rotation"));
    const under = (r: number) => mod(Math.round((P - r) / a), N);
    let last = segIndex.current;
    let lastRot = rot();

    // Keep whatever slice was selected under the (possibly moved) pointer
    gsap.set(wheel, { rotation: P - segIndex.current * a });

    const check = () => {
      const r = rot();
      const k = under(r);
      if (k !== last) {
        last = k;
        if (!calm()) {
          const dir = r >= lastRot ? 1 : -1;
          gsap.fromTo(
            flapRef.current,
            { rotate: -dir * 24 },
            { rotate: 0, duration: 0.45, ease: "elastic.out(1,0.35)", overwrite: true },
          );
        }
        cb.current.onTick?.(segs[k]);
      }
      lastRot = r;
    };
    const settle = () => {
      const k = under(rot());
      segIndex.current = k;
      cb.current.onSettle(Math.max(0, segs[k]));
    };
    const turnTo = (target: number, duration: number, ease: string) => {
      gsap.to(wheel, {
        rotation: target,
        duration: calm() ? 0.01 : duration,
        ease,
        overwrite: true,
        onUpdate: check,
        onComplete: () => {
          drag.update();
          settle();
        },
      });
    };
    // Closest rotation that puts slice k under the pointer
    const nearest = (k: number) => {
      const base = P - k * a;
      return base + 360 * Math.round((rot() - base) / 360);
    };

    const [drag] = Draggable.create(wheel, {
      type: "rotation",
      inertia: true,
      snap: (v: number) => P + Math.round((v - P) / a) * a,
      onPress: () => gsap.killTweensOf(wheel),
      onDrag: check,
      onThrowUpdate: check,
      onThrowComplete: settle,
      onDragEnd() {
        if (!this.isThrowing) settle();
      },
      onClick(e: PointerEvent) {
        const seg = (e.target as Element).closest<HTMLElement>("[data-seg]");
        if (seg) turnTo(nearest(Number(seg.dataset.seg)), 0.9, "power3.inOut");
      },
    });

    api.current = {
      spin: () => {
        let k = Math.floor(Math.random() * N);
        if (N > 1 && k === under(rot())) k = (k + 1 + Math.floor(Math.random() * (N - 1))) % N;
        const base = P - k * a;
        const r = rot();
        const turns = 4 + Math.floor(Math.random() * 2);
        turnTo(base + 360 * Math.ceil((r + 360 * turns - base) / 360), 4 + Math.random() * 1.2, "power4.out");
      },
      goTo: (k) => turnTo(nearest(k), 0.9, "power3.inOut"),
      step: (d) => turnTo(nearest(mod(under(rot()) + d, N)), 0.5, "power2.out"),
    };

    return () => {
      drag.kill();
      gsap.killTweensOf(wheel);
      api.current = null;
    };
  }, [P, a, N, segs]);

  useImperativeHandle(ref, () => ({ spin: () => api.current?.spin() }), []);

  return (
    <div className={`relative aspect-square select-none ${className}`}>
      {/* Outer rim */}
      <div
        aria-hidden="true"
        className="absolute -inset-[3%] rounded-full p-[1.2%] shadow-[0_30px_80px_-20px_var(--glow)]"
        style={{ background: "var(--brand-gradient)" }}
      >
        <div className="h-full w-full rounded-full bg-[#05060f]" />
      </div>

      {/* The spinning part */}
      <div ref={wheelRef} className="absolute inset-0 cursor-grab touch-none rounded-full active:cursor-grabbing">
        {segs.map((m, i) => (
          <div
            key={i}
            data-seg={i}
            className="absolute inset-0"
            style={{ clipPath: clip, transform: `rotate(${i * a}deg)` }}
          >
            <div className="absolute top-0 h-1/2 overflow-hidden" style={{ left: `${50 - boxW / 2}%`, width: `${boxW}%` }}>
              <MediaFrame media={m < 0 ? undefined : media[m]} title={title} seed={seed + i} mode="thumb" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#05060f]/10 to-[#05060f]/80" />
              <span
                dir="ltr"
                className="absolute left-1/2 top-[9%] -translate-x-1/2 rounded-full bg-[#05060f]/70 px-1.5 font-mono text-[10px] leading-4 text-white/90 backdrop-blur"
              >
                {String((m < 0 ? i : m) + 1).padStart(2, "0")}
              </span>
            </div>
          </div>
        ))}
        {/* Dividers + pegs */}
        <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full">
          {segs.map((_, i) => {
            const t2 = (((i + 0.5) * a - 90) * Math.PI) / 180;
            return (
              <g key={i}>
                <line x1="50" y1="50" x2={50 + 50 * Math.cos(t2)} y2={50 + 50 * Math.sin(t2)} stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" />
                <circle cx={50 + 46.5 * Math.cos(t2)} cy={50 + 46.5 * Math.sin(t2)} r="1.1" fill="#f0f1f2" />
              </g>
            );
          })}
          <circle cx="50" cy="50" r="49.6" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.4" />
        </svg>
      </div>

      {/* Highlight on the slice under the pointer (doesn't spin) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ transform: `rotate(${P}deg)` }}>
        <div
          className="absolute inset-0"
          style={{ clipPath: clip, background: "radial-gradient(circle at 50% 0%, rgba(113,174,207,0.35), transparent 55%)" }}
        />
        {/* The flap */}
        <span className="absolute left-1/2 top-[-5%] z-10 block h-[13%] w-[9%] -translate-x-1/2">
          <span
            ref={flapRef}
            className="block h-full w-full origin-[50%_15%] drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
            style={{ clipPath: "polygon(0 0,100% 0,50% 100%)", background: "linear-gradient(#f0f1f2,#93c2db)" }}
          />
        </span>
      </div>

      {/* Hub */}
      <button
        type="button"
        onClick={() => api.current?.spin()}
        onKeyDown={(e) => {
          const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
          if (d) {
            e.preventDefault();
            api.current?.step(d);
          }
        }}
        aria-label={t("projects.spin")}
        className="group absolute left-1/2 top-1/2 z-10 grid h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/15 bg-[#0d1024] text-white shadow-[0_0_0_6px_rgba(5,6,15,0.6),0_10px_30px_rgba(0,0,0,0.5)] transition-transform hover:scale-105 active:scale-95"
      >
        <span className="flex flex-col items-center gap-0.5">
          <Icon name="spin" size={22} className="transition-transform duration-500 group-hover:rotate-180" />
          <span className="text-[11px] font-bold uppercase tracking-wider rtl:tracking-normal">{t("projects.spin")}</span>
        </span>
      </button>
    </div>
  );
});

export default MediaWheel;
