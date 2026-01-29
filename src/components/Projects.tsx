import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ProjectsService } from "../services/ProjectsService";
import type { Project } from "../types";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  const { t, i18n } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLang = i18n.language as "en" | "ar";

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await ProjectsService.getFeatured();
        setProjects(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load projects",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section
        id="projects"
        className="py-16 md:py-24 bg-[hsl(220,25%,8%)] relative overflow-hidden"
      >
        <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-12 bg-white/10 rounded w-64 mx-auto mb-4"></div>
              <div className="h-6 bg-white/10 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="projects"
        className="py-16 md:py-24 bg-[hsl(220,25%,8%)] relative overflow-hidden"
      >
        <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
          <div className="text-center text-red-400">
            <p>{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="py-16 md:py-24 bg-[hsl(220,25%,8%)] relative overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[hsl(0,0%,98%)] bg-gradient-to-r from-[hsl(210,55%,45%)] via-[hsl(180,60%,50%)] to-[hsl(210,55%,45%)] bg-clip-text text-transparent">
            {t("projects.title")}
          </h2>
          <p className="text-lg text-[hsl(0,0%,75%)] max-w-2xl mx-auto leading-relaxed">
            {t("projects.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              currentLang={currentLang}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
