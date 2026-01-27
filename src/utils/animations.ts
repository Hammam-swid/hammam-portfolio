import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

/**
 * Animation configurations and presets for GSAP
 */

export const animationConfig = {
  // Duration presets
  duration: {
    fast: 0.3,
    normal: 0.6,
    slow: 1,
    slower: 1.5,
  },

  // Easing presets
  ease: {
    power1: "power1.out",
    power2: "power2.out",
    power3: "power3.out",
    power4: "power4.out",
    elastic: "elastic.out(1, 0.5)",
    back: "back.out(1.7)",
    bounce: "bounce.out",
  },

  // Stagger presets
  stagger: {
    fast: 0.1,
    normal: 0.2,
    slow: 0.3,
  },
};

/**
 * Fade in animation from bottom
 */
export const fadeInUp = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    y: 50,
    duration: animationConfig.duration.normal,
    ease: animationConfig.ease.power2,
    ...options,
  });
};

/**
 * Fade in animation from left
 */
export const fadeInLeft = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    x: -50,
    duration: animationConfig.duration.normal,
    ease: animationConfig.ease.power2,
    ...options,
  });
};

/**
 * Fade in animation from right
 */
export const fadeInRight = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    x: 50,
    duration: animationConfig.duration.normal,
    ease: animationConfig.ease.power2,
    ...options,
  });
};

/**
 * Scale in animation
 */
export const scaleIn = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    scale: 0.8,
    duration: animationConfig.duration.normal,
    ease: animationConfig.ease.back,
    ...options,
  });
};

/**
 * Rotate in animation
 */
export const rotateIn = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    rotation: 180,
    scale: 0.5,
    duration: animationConfig.duration.slow,
    ease: animationConfig.ease.power3,
    ...options,
  });
};

/**
 * Stagger animation for multiple elements
 */
export const staggerFadeIn = (elements: string | Element[], options = {}) => {
  return gsap.from(elements, {
    opacity: 0,
    y: 30,
    duration: animationConfig.duration.normal,
    stagger: animationConfig.stagger.normal,
    ease: animationConfig.ease.power2,
    ...options,
  });
};

/**
 * Scroll-triggered animation
 */
export const scrollTriggerAnimation = (
  element: string | Element,
  animationProps: gsap.TweenVars,
  scrollTriggerProps: ScrollTrigger.Vars = {},
) => {
  return gsap.from(element, {
    ...animationProps,
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      end: "bottom 20%",
      toggleActions: "play none none reverse",
      ...scrollTriggerProps,
    },
  });
};

/**
 * Parallax effect
 */
export const parallax = (element: string | Element, speed = 0.5) => {
  return gsap.to(element, {
    yPercent: -50 * speed,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });
};

/**
 * Text reveal animation (useful for hero section)
 */
export const textReveal = (element: string | Element, options = {}) => {
  return gsap.from(element, {
    opacity: 0,
    y: 100,
    skewY: 7,
    duration: animationConfig.duration.slow,
    ease: animationConfig.ease.power4,
    ...options,
  });
};

/**
 * Magnetic button effect
 */
export const magneticEffect = (button: HTMLElement, strength = 0.5) => {
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
};

/**
 * Smooth scroll to section
 */
export const smoothScrollTo = (target: string | Element, offset = 0) => {
  gsap.to(window, {
    duration: 1,
    scrollTo: {
      y: target,
      offsetY: offset,
    },
    ease: animationConfig.ease.power2,
  });
};

/**
 * Create a GSAP timeline
 */
export const createTimeline = (options = {}) => {
  return gsap.timeline(options);
};

/**
 * Hover animation for cards
 */
export const cardHoverAnimation = (card: HTMLElement) => {
  const handleMouseEnter = () => {
    gsap.to(card, {
      y: -10,
      scale: 1.02,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const handleMouseLeave = () => {
    gsap.to(card, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  card.addEventListener("mouseenter", handleMouseEnter);
  card.addEventListener("mouseleave", handleMouseLeave);

  return () => {
    card.removeEventListener("mouseenter", handleMouseEnter);
    card.removeEventListener("mouseleave", handleMouseLeave);
  };
};

export default {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
  scaleIn,
  rotateIn,
  staggerFadeIn,
  scrollTriggerAnimation,
  parallax,
  textReveal,
  magneticEffect,
  smoothScrollTo,
  createTimeline,
  cardHoverAnimation,
};
