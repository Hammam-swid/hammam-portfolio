import { useTranslation } from "react-i18next";
import { experiences, getExperienceDuration } from "../data/experiences";
import "./Experience.css";

const Experience = () => {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language as "en" | "ar";

  return (
    <section id="experience" className="experience section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("experience.title")}</h2>
          <p className="section-subtitle">{t("experience.subtitle")}</p>
        </div>

        <div className="experience-timeline">
          {experiences.map((exp, index) => {
            const duration = getExperienceDuration(exp.startDate, exp.endDate);

            return (
              <div key={exp.id} className="timeline-item">
                <div className="timeline-marker">
                  <div className="timeline-dot"></div>
                  {index < experiences.length - 1 && (
                    <div className="timeline-line"></div>
                  )}
                </div>

                <div className="timeline-content card">
                  <div className="timeline-header">
                    <div>
                      <h3 className="timeline-title">
                        {exp.position[currentLang]}
                      </h3>
                      <p className="timeline-company">
                        {exp.company[currentLang]}
                      </p>
                    </div>

                    <div className="timeline-duration">
                      <span className="duration-badge">
                        {exp.endDate
                          ? t("experience.duration", { months: duration })
                          : t("experience.present")}
                      </span>
                    </div>
                  </div>

                  <p className="timeline-description">
                    {exp.description[currentLang]}
                  </p>

                  <div className="timeline-technologies">
                    {exp.technologies.map((tech, techIndex) => (
                      <span key={techIndex} className="tech-badge">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Experience;
