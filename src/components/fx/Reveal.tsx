import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, MOTION_OK } from "../../lib/gsap";

/**
 * Fades + lifts every `[data-reveal]` descendant into view as it scrolls in,
 * staggered in DOM order. Pass `deps` to rebuild when content changes.
 */
export default function Reveal({
  as: Tag = "div",
  children,
  className,
  id,
  deps = [],
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  id?: string;
  deps?: unknown[];
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current);
        gsap.set(items, { autoAlpha: 0, y: 40 });
        gsap.utils.toArray<HTMLElement>(items).forEach((el) => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            delay: Number(el.dataset.reveal || 0) * 0.08,
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: deps, revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}
