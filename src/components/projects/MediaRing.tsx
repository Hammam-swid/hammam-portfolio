import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ProjectMedia } from "../../types";
import { useLang } from "../../hooks/useLang";
import { gsap, Draggable } from "../../lib/gsap";
import MediaFrame from "./MediaFrame";
import Icon from "../fx/Icon";

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Media picker shaped like a 3D cylinder: thumbnails stand on a ring seen
 * from the front and curve away into depth. Drag it (with inertia), scroll
 * it, or click a thumbnail; the item that settles at the front is selected.
 * Item size follows the available width.
 */
export default function MediaRing({
  media,
  selected,
  onSelect,
  title,
  seed,
}: {
  media: ProjectMedia[];
  selected: number;
  onSelect: (i: number) => void;
  title: string;
  seed: number;
}) {
  const { t, isRTL } = useLang();
  const box = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const proxy = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const rot = useRef(selected); // current position, in items (fractional while moving)
  const cb = useRef(onSelect);
  useEffect(() => {
    cb.current = onSelect;
  });

  // Size from the box width: about 3.5 items fit across.
  const [bw, setBw] = useState(600);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBw(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  // phones get relatively bigger items (fewer fit, but each is easier to see and hit)
  const W = Math.round(Math.min(220, Math.max(112, bw * (bw < 520 ? 0.4 : 0.29))));
  const H = Math.round((W * 9) / 16);
  const radius = W * 2.6;
  const n = media.length;
  // Neighbouring items sit about one item-width apart on the ring.
  const natural = (2 * Math.asin(Math.min(1, (W * 1.02) / 2 / radius)) * 180) / Math.PI;
  const step = Math.min(natural, 360 / Math.max(n, 1));
  const dir = isRTL ? -1 : 1;

  /** Put the ring at `pos` (in items) and shade every item by its distance from the front. */
  const render = useRef<(pos: number) => void>(() => {});
  useLayoutEffect(() => {
    render.current = (pos: number) => {
      rot.current = pos;
      if (!ring.current) return;
      gsap.set(ring.current, { rotationY: -dir * pos * step, z: -radius });
      ring.current.querySelectorAll<HTMLElement>("[data-item]").forEach((el, i) => {
        const d = Math.abs(i - pos) * step;
        const k = Math.min(d / 90, 1);
        el.style.opacity = String(d > 95 ? 0 : 1 - k * 0.7);
        el.style.filter = `brightness(${1 - k * 0.6})`;
        el.style.pointerEvents = d > 95 ? "none" : "";
        el.dataset.front = Math.round(pos) === i ? "1" : "";
      });
    };
    render.current(rot.current);
  }, [dir, step, radius, n]);

  const settle = () => {
    const i = Math.round(rot.current);
    cb.current(Math.max(0, Math.min(n - 1, i)));
  };

  const turnTo = (target: number, duration = 0.7) => {
    tween.current?.kill();
    const o = { p: rot.current };
    tween.current = gsap.to(o, {
      p: target,
      duration: calm() ? 0.01 : duration,
      ease: "power3.out",
      onUpdate: () => render.current(o.p),
      onComplete: settle,
    });
  };

  // Follow selection changes made elsewhere (arrow keys, buttons in the modal)
  useEffect(() => {
    if (Math.round(rot.current) !== selected) turnTo(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when the selection changes
  }, [selected]);

  // Dragging: a hidden proxy moves in x; its offset becomes ring rotation.
  useEffect(() => {
    if (!box.current || !proxy.current || n < 2) return;
    const px = W * 0.9; // pixels of drag per item
    let start = 0;
    const toPos = (x: number) => start - (dir * x) / px;
    const clampPos = (p: number) => Math.max(-0.4, Math.min(n - 0.6, p));
    const [drag] = Draggable.create(proxy.current, {
      type: "x",
      trigger: box.current,
      inertia: true,
      onPress() {
        tween.current?.kill();
        start = rot.current;
        gsap.set(proxy.current, { x: 0 });
        this.update();
      },
      onDrag() {
        render.current(clampPos(toPos(this.x)));
      },
      onThrowUpdate() {
        render.current(clampPos(toPos(this.x)));
      },
      snap: (x: number) => {
        const pos = Math.max(0, Math.min(n - 1, Math.round(toPos(x))));
        return ((start - pos) * px) / dir;
      },
      onThrowComplete: settle,
      onDragEnd() {
        if (!this.isThrowing) settle();
      },
      onClick(e: PointerEvent) {
        const el = (e.target as Element).closest<HTMLElement>("[data-item]");
        if (el) turnTo(Number(el.dataset.item));
      },
    });

    // Trackpad / mouse wheel: one item per notch
    let lock = false;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(d) < 4) return;
      e.preventDefault();
      if (lock) return;
      lock = true;
      setTimeout(() => (lock = false), 220);
      const next = Math.max(0, Math.min(n - 1, Math.round(rot.current) + Math.sign(d) * dir));
      turnTo(next, 0.5);
    };
    const el = box.current;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      drag.kill();
      el.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- settle/turnTo only read refs
  }, [n, dir, W]);

  if (n < 2) return null;

  return (
    <div className="flex flex-col gap-1">
      <div
        ref={box}
        role="tablist"
        aria-label={t("projects.media")}
        className="relative cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]"
        style={{ perspective: W * 6, height: H + 40 }}
      >
        <div ref={proxy} className="hidden" />
        <div ref={ring} data-ring className="absolute left-1/2 top-1/2 h-0 w-0" style={{ transformStyle: "preserve-3d" }}>
          {media.map((m, i) => (
            <button
              key={m.src + i}
              type="button"
              role="tab"
              data-item={i}
              aria-selected={i === selected}
              aria-label={`${m.type === "video" ? t("projects.video") : t("projects.image")} ${i + 1}`}
              onKeyDown={(e) => e.key === "Enter" && turnTo(i)}
              className="group absolute overflow-hidden rounded-xl border-2 border-white/10 bg-[#0d1024] shadow-[0_12px_34px_rgba(0,0,0,0.55)] transition-[border-color,box-shadow] duration-300 [backface-visibility:hidden] data-[front=1]:border-[#71aecf] data-[front=1]:shadow-[0_0_0_4px_rgba(113,174,207,0.25),0_16px_44px_rgba(0,0,0,0.6)]"
              style={{
                width: W,
                height: H,
                left: -W / 2,
                top: -H / 2,
                transform: `rotateY(${dir * i * step}deg) translateZ(${radius}px)`,
              }}
            >
              <MediaFrame media={m} title={title} seed={seed + i} mode="thumb" />
              {m.type === "video" && (
                <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                  <Icon name="play" size={16} />
                </span>
              )}
              <span dir="ltr" className="absolute bottom-1 end-1.5 rounded bg-black/60 px-1 font-mono text-[10px] text-white/90">
                {String(i + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>
      <p className="m-0 flex items-center justify-center gap-2 text-[11px] text-white/45">
        <Icon name="arrow" size={12} className="-scale-x-100" />
        {t("projects.dragMedia")}
        <Icon name="arrow" size={12} />
      </p>
    </div>
  );
}
