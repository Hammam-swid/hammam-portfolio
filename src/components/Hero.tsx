import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useMagneticEffect } from "../hooks/useGSAPAnimation";

const Hero = () => {
  const { t } = useTranslation();
  const heroRef = useRef<HTMLDivElement>(null);
  const greetingRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const roleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const primaryBtnRef = useMagneticEffect(0.3);
  const secondaryBtnRef = useMagneticEffect(0.3);

  useEffect(() => {
    // Entry Animation (Timeline)
    const tl = gsap.timeline({ delay: 0.2 });

    const elements = [
      greetingRef.current,
      nameRef.current,
      roleRef.current,
      subtitleRef.current,
      ctaRef.current,
    ];

    // Use fromTo with clearProps to ensure final state
    tl.fromTo(
      elements,
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all", // Clear all inline styles after animation completes
      },
    );

    // Subtle background mesh movement handled by CSS animation in tailwind config

    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;

      // Parallax for visual element
      const { clientX, clientY } = e;
      const xPos = (clientX / window.innerWidth - 0.5) * 20;
      const yPos = (clientY / window.innerHeight - 0.5) * 20;

      gsap.to(".hero-visual-element", {
        x: xPos,
        y: yPos,
        duration: 1,
        ease: "power2.out",
      });

      // Mouse-follow gradient glow
      const rect = heroRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      gsap.to(".hero-glow", {
        x: x,
        y: y,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects");
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContact = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-[80px] md:pt-[100px]"
      ref={heroRef}
    >
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-bg-primary overflow-hidden">
        <div className="hero-mesh-gradient absolute inset-0 w-full h-full">
          <div className="absolute w-[50vw] h-[50vw] bg-primary -top-[10%] -left-[10%] rounded-full blur-[100px] opacity-30 animate-float"></div>
          <div className="absolute w-[40vw] h-[40vw] bg-secondary -bottom-[10%] -right-[10%] rounded-full blur-[100px] opacity-30 animate-float animation-delay-[5s]"></div>
          <div className="absolute w-[30vw] h-[30vw] bg-accent top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] opacity-20 -z-10 animate-pulse-glow"></div>
        </div>
        <div className="hero-glow absolute top-0 left-0 w-[800px] h-[800px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 z-0 blur-3xl opacity-80 bg-linear-to-r from-secondary/30 to-primary"></div>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center relative z-20 text-center lg:text-left justify-items-center lg:justify-items-start">
        <div className="flex flex-col gap-4">
          <div
            className="flex items-center justify-center lg:justify-start gap-4 mb-2"
            ref={greetingRef}
          >
            <span className="w-10 h-0.5 bg-accent"></span>
            <p className="font-mono text-sm text-accent tracking-wider uppercase">
              {t("hero.greeting")}
            </p>
          </div>

          <h1
            className="font-display text-4xl sm:text-6xl lg:text-8xl font-extrabold leading-[1.1] mb-0 text-text-primary tracking-tighter"
            ref={nameRef}
          >
            {t("hero.name")}
            <span className="text-primary">.</span>
          </h1>

          <div className="mb-4" ref={roleRef}>
            <h2 className="text-xl sm:text-2xl lg:text-4xl font-normal text-text-secondary leading-snug">
              {t("hero.role")}
            </h2>
          </div>

          <p
            className="text-base sm:text-lg lg:text-xl text-text-tertiary max-w-[500px] leading-relaxed mb-8 mx-auto lg:mx-0"
            ref={subtitleRef}
          >
            {t("hero.subtitle")}
          </p>

          <div
            className="flex items-center justify-center lg:justify-start gap-4 flex-wrap mb-16"
            ref={ctaRef}
          >
            <button
              ref={primaryBtnRef}
              onClick={scrollToProjects}
              className="px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-300 bg-primary text-white hover:bg-primary-light w-full sm:w-auto"
            >
              <span>{t("hero.cta.primary")}</span>
              <span className="group-hover:translate-x-1 transition-transform">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 10L2.5 10M17.5 10L12.5 5M17.5 10L12.5 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>

            <button
              ref={secondaryBtnRef}
              onClick={scrollToContact}
              className="px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-all duration-300 border border-text-tertiary text-text-primary hover:border-text-primary w-full sm:w-auto"
            >
              <span>{t("hero.cta.secondary")}</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center relative h-full min-h-[400px]">
          <div className="hero-visual-element relative w-[300px] h-[300px]">
            {/* Visual Circle */}
            <div className="w-full h-full rounded-full border-2 border-primary/20 relative before:content-[''] before:absolute before:-inset-[15px] before:rounded-full before:border before:border-dashed before:border-secondary/30 before:animate-[spin_20s_linear_infinite]"></div>
            {/* Visual Dots */}
            <div className="absolute -right-5 -bottom-5 w-[100px] h-[100px] bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)] bg-size-[10px_10px] -z-10"></div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-1/2 translate-x-1/2 lg:right-10 lg:translate-x-0 flex flex-row lg:flex-col items-center gap-2 writing-mode-horizontal lg:writing-mode-vertical">
        <div className="w-px lg:w-[2px] h-[30px] lg:h-[60px] bg-linear-to-b from-text-tertiary to-transparent relative overflow-hidden after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-1/2 after:bg-primary after:animate-[drop_2s_cubic-bezier(0.77,0,0.175,1)_infinite]"></div>
        <span className="font-mono text-xs text-text-tertiary tracking-widest uppercase">
          {t("hero.scrollDown")}
        </span>
      </div>

      <style>
        {`
        @keyframes drop {
          0% { top: -50%; }
          100% { top: 100%; }
        }
      `}
      </style>
    </section>
  );
};

export default Hero;
