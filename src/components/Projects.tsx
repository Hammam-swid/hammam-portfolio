import { useTranslation } from "react-i18next";
import { projects } from "../data/projects";
import ProjectCard from "./ProjectCard";
import "./Projects.css";

const Projects = () => {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language as "en" | "ar";
  const featuredProjects = projects.filter((project) => project.featured);

  return (
    <section id="projects" className="projects section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("projects.title")}</h2>
          <p className="section-subtitle">{t("projects.subtitle")}</p>
        </div>

        <div className="projects-grid">
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
