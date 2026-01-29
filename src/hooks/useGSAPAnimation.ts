import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook for GSAP animations with automatic cleanup
 */
export const useGSAP = (
  animationFn: (context: gsap.Context) => void,
  dependencies: React.DependencyList = [],
) => {
  useEffect(() => {
    const ctx = gsap.context(() => {
      animationFn(ctx);
    });

    return () => ctx.revert(); // Cleanup
  }, dependencies);
};

/**
 * Hook for scroll-triggered animations
 */
export const useScrollTrigger = (
  element: React.RefObject<HTMLElement>,
  animationProps: gsap.TweenVars,
  triggerProps: ScrollTrigger.Vars = {},
) => {
  useEffect(() => {
    if (!element.current) return () => {};

    const animation = gsap.from(element.current, {
      ...animationProps,
      scrollTrigger: {
        trigger: element.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
        ...triggerProps,
      },
    });

    return () => {
      animation.kill();
    };
  }, [element]);
};

/**
 * Hook for fade in up animation
 */
export const useFadeInUp = (dependencies: React.DependencyList = []) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return () => {};

    const animation = gsap.from(ref.current, {
      opacity: 0,
      y: 50,
      duration: 0.6,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    return () => animation.kill();
  }, dependencies);

  return ref;
};

/**
 * Hook for stagger animation on children
 */
export const useStaggerAnimation = <T extends HTMLElement = HTMLDivElement>(
  dependencies: React.DependencyList = [],
) => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!containerRef.current) return () => {};

    const children = containerRef.current.children;

    const animation = gsap.from(children, {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    });

    return () => animation.kill();
  }, dependencies);

  return containerRef;
};

/**
 * Hook for text reveal animation
 */
export const useTextReveal = (dependencies: React.DependencyList = []) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return () => {};

    const animation = gsap.from(ref.current, {
      opacity: 0,
      y: 100,
      skewY: 7,
      duration: 1,
      ease: "power4.out",
    });

    return () => animation.kill();
  }, dependencies);

  return ref;
};

/**
 * Hook for parallax effect
 */
export const useParallax = (speed = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return () => {};

    const animation = gsap.to(ref.current, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: ref.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });

    return () => animation.kill();
  }, [speed]);

  return ref;
};

/**
 * Hook for magnetic button effect
 */
export const useMagneticEffect = (strength = 0.5) => {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = ref.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { left, top, width, height } = button.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(button, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.5)",
      });
    };

    button.addEventListener("mousemove", handleMouseMove);
    button.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      button.removeEventListener("mousemove", handleMouseMove);
      button.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [strength]);

  return ref;
};

export default useGSAP;
