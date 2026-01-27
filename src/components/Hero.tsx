import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import { useMagneticEffect } from "../hooks/useGSAPAnimation";
import "./Hero.css";

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
    // Create timeline for sequential animations
    const tl = gsap.timeline({ delay: 0.2 });

    tl.from(greetingRef.current, {
      y: 50,
      duration: 0.8,
      ease: "power3.out",
    })
      .from(
        nameRef.current,
        {
          y: 50,
          skewY: 5,
          duration: 1,
          ease: "power4.out",
        },
        "-=0.4",
      )
      .from(
        roleRef.current,
        {
          y: 50,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.5",
      )
      .from(
        subtitleRef.current,
        {
          y: 30,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.4",
      )
      .from(
        ctaRef.current?.children || [],
        {
          y: 20,
          stagger: 0.2,
          duration: 0.5,
          ease: "back.out(1.7)",
        },
        "-=0.3",
      );

    // Floating animation for the entire hero
    if (heroRef.current) {
      gsap.to(heroRef.current, {
        y: -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    }

    // Animate gradient orbs
    const orbs = document.querySelectorAll(".hero-orb");
    orbs.forEach((orb, index) => {
      gsap.to(orb, {
        x: `random(-50, 50)`,
        y: `random(-50, 50)`,
        scale: `random(0.8, 1.2)`,
        duration: `random(3, 5)`,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: index * 0.2,
      });
    });

    // Scroll indicator animation
    gsap.to(".scroll-indicator", {
      y: 10,
      duration: 1,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });
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
    <section id="hero" className="hero section">
      {/* Animated Background Orbs */}
      <div className="hero-orbs">
        <div className="hero-orb hero-orb-1"></div>
        <div className="hero-orb hero-orb-2"></div>
        <div className="hero-orb hero-orb-3"></div>
      </div>

      <div className="container">
        <div className="hero-content" ref={heroRef}>
          <p className="hero-greeting" ref={greetingRef}>
            {t("hero.greeting")}
          </p>

          <h1 className="hero-name" ref={nameRef}>
            <span className="gradient-text">{t("hero.name")}</span>
          </h1>

          <h2 className="hero-role" ref={roleRef}>
            {t("hero.role")}
          </h2>

          <p className="hero-subtitle" ref={subtitleRef}>
            {t("hero.subtitle")}
          </p>

          <div className="hero-cta" ref={ctaRef}>
            <button
              ref={primaryBtnRef}
              onClick={scrollToProjects}
              className="btn btn-primary"
            >
              {t("hero.cta.primary")}
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.5 15L12.5 10L7.5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              ref={secondaryBtnRef}
              onClick={scrollToContact}
              className="btn"
            >
              {t("hero.cta.secondary")}
            </button>
          </div>

          <div className="scroll-indicator">
            <div className="scroll-icon">
              <div className="scroll-wheel"></div>
            </div>
            <p>{t("hero.scrollDown")}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
