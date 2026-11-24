import { useLayoutEffect, useRef } from "react";
import { splitLetters } from "../../lib/letters";

/**
 * Renders text as `[data-letter]` spans grouped in `[data-word]` spans.
 * React owns these nodes, so changing language re-renders them cleanly.
 * With `gradient`, each letter paints its own slice of one shared gradient,
 * so the word keeps a continuous gradient while letters fly around.
 */
export default function Letters({
  text,
  gradient = false,
  wordClassName = "",
  letterClassName = "",
}: {
  text: string;
  gradient?: boolean;
  wordClassName?: string;
  letterClassName?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = text.split(" ");

  useLayoutEffect(() => {
    if (!gradient || !ref.current) return;
    const root = ref.current;
    const paint = () => {
      // offset* ignores transforms, so this is stable mid-animation
      const W = root.offsetWidth;
      const H = root.offsetHeight;
      root.querySelectorAll<HTMLElement>("[data-letter]").forEach((p) => {
        const w = p.parentElement as HTMLElement;
        const x = w.offsetLeft + p.offsetLeft;
        const y = w.offsetTop + p.offsetTop;
        p.style.backgroundSize = `${W}px ${H}px`;
        p.style.backgroundPosition = `${-x}px ${-y}px`;
      });
    };
    paint();
    const ro = new ResizeObserver(paint);
    ro.observe(root);
    document.fonts?.ready.then(paint);
    return () => ro.disconnect();
  }, [text, gradient]);

  return (
    <span ref={ref} className="relative inline-block" aria-label={text}>
      {words.map((w, wi) => (
        <span
          key={`${w}-${wi}`}
          data-word
          aria-hidden="true"
          className={`relative inline-block whitespace-nowrap ${wi < words.length - 1 ? "me-[0.28em]" : ""} ${wordClassName}`}
        >
          {splitLetters(w).map((ch, i) => (
            <span
              key={`${ch}-${i}`}
              data-letter
              className={`inline-block ${gradient ? "text-gradient" : ""} ${letterClassName}`}
            >
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
