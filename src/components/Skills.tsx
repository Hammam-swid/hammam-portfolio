import { useTranslation } from "react-i18next";
import { getSkillsByCategory } from "../data/skills";
import "./Skills.css";

const Skills = () => {
  const { t } = useTranslation();

  const categories = ["frontend", "backend", "devops", "tools"] as const;

  return (
    <section id="skills" className="skills section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{t("skills.title")}</h2>
          <p className="section-subtitle">{t("skills.subtitle")}</p>
        </div>

        <div className="skills-categories">
          {categories.map((category) => {
            const categorySkills = getSkillsByCategory(category);

            return (
              <div key={category} className="skills-category">
                <h3 className="category-title">
                  {t(`skills.categories.${category}`)}
                </h3>

                <div className="skills-grid">
                  {categorySkills.map((skill) => (
                    <div key={skill.id} className="skill-card card">
                      <div className="skill-header">
                        <span className="skill-name">{skill.name}</span>
                        <span className="skill-level">{skill.level}%</span>
                      </div>

                      <div className="skill-progress-bar">
                        <div
                          className="skill-progress"
                          style={{ width: `${skill.level}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
