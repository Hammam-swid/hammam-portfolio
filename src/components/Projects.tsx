import { useTranslation } from "react-i18next";
import { projects } from "../data/projects";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language as "en" | "ar";
  const featuredProjects = projects.filter((project) => project.featured);

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
          {featuredProjects.map((project) => (
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
