import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import type { Project } from "../data/projects";

interface ProjectCardProps {
  project: Project;
  currentLang: "en" | "ar";
}

const ProjectCard = ({ project, currentLang }: ProjectCardProps) => {
  const { t } = useTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const image = imageRef.current;
    if (!card || !image) return;

    // Tilt effect on hover
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1000,
      });

      gsap.to(image, {
        scale: 1.1,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.to(image, {
        scale: 1,
        duration: 0.5,
        ease: "power2.out",
      });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className="bg-[rgba(255,255,255,0.05)] backdrop-blur-sm rounded-xl border border-[rgba(255,255,255,0.1)] overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 hover:border-primary/30"
    >
      <div
        ref={imageRef}
        className="w-full h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden"
      >
        <div className="flex items-center justify-center">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" fill="url(#gradient)" />
            <path
              d="M30 40L40 50L60 30"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="70" cy="60" r="15" stroke="white" strokeWidth="4" />
            <defs>
              <linearGradient id="gradient" x1="0" y1="0" x2="100" y2="100">
                <stop offset="0%" stopColor="var(--color-primary)" />
                <stop offset="100%" stopColor="var(--color-secondary)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-3">
          {project.title[currentLang]}
        </h3>
        <p className="text-base text-text-secondary mb-4 line-clamp-3">
          {project.description[currentLang]}
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {project.technologies.slice(0, 4).map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md"
            >
              {tech}
            </span>
          ))}
          {project.technologies.length > 4 && (
            <span className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md">
              +{project.technologies.length - 4}
            </span>
          )}
        </div>

        <div className="flex gap-3">
          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-primary/20 border border-primary/30 rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="M10 6V10L13 13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {t("projects.viewDemo")}
            </a>
          )}

          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg hover:bg-[rgba(255,255,255,0.1)] hover:border-text-primary transition-all duration-300"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 2C5.58 2 2 5.58 2 10C2 13.54 4.29 16.53 7.47 17.59C7.87 17.66 8.02 17.42 8.02 17.21C8.02 17.02 8.01 16.39 8.01 15.72C6 16.09 5.48 15.21 5.32 14.78C5.23 14.56 4.84 13.84 4.5 13.65C4.22 13.5 3.82 13.13 4.49 13.12C5.12 13.11 5.57 13.7 5.72 13.94C6.44 15.15 7.59 14.81 8.05 14.6C8.12 14.08 8.33 13.73 8.56 13.53C6.84 13.33 5.04 12.64 5.04 9.59C5.04 8.68 5.23 7.93 5.74 7.35C5.66 7.15 5.38 6.35 5.82 5.25C5.82 5.25 6.49 5.04 8.02 6.07C8.66 5.89 9.34 5.8 10.02 5.8C10.7 5.8 11.38 5.89 12.02 6.07C13.55 5.03 14.22 5.25 14.22 5.25C14.66 6.35 14.38 7.15 14.3 7.35C14.81 7.93 15 8.67 15 9.59C15 12.65 13.19 13.33 11.47 13.53C11.76 13.78 12.01 14.26 12.01 15.01C12.01 16.08 12 16.94 12 17.21C12 17.42 12.15 17.67 12.55 17.59C14.1382 17.0539 15.5117 16.0332 16.4728 14.6716C17.4339 13.31 17.9338 11.6814 17.9 10.02C18 5.58 14.42 2 10 2V2Z"
                  fill="currentColor"
                />
              </svg>
              {t("projects.viewCode")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
