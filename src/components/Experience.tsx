import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ExperiencesService } from "../services/ExperiencesService";
import type { Experience } from "../types";

const ExperienceComponent = () => {
  const { t, i18n } = useTranslation();
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLang = i18n.language as "en" | "ar";

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setLoading(true);
        const data = await ExperiencesService.getAll();
        setExperiences(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load experiences",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  if (loading) {
    return (
      <section
        id="experience"
        className="py-16 md:py-24 bg-bg-secondary relative overflow-hidden"
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
        id="experience"
        className="py-16 md:py-24 bg-bg-secondary relative overflow-hidden"
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
      id="experience"
      className="py-16 md:py-24 bg-bg-secondary relative overflow-hidden"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            {t("experience.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto leading-relaxed">
            {t("experience.subtitle")}
          </p>
        </div>

        <div className="max-w-[900px] mx-auto relative">
          {experiences.map((exp, index) => {
            const duration = ExperiencesService.getExperienceDuration(
              exp.startDate,
              exp.endDate,
            );

            return (
              <div
                key={exp.id}
                className="grid grid-cols-[auto_1fr] gap-6 md:gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center relative">
                  <div className="w-5 h-5 md:w-5 md:h-5 bg-gradient-to-r from-primary to-secondary rounded-full border-[3px] border-bg-secondary shadow-[0_0_20px_rgba(66,135,245,0.4)] z-10"></div>
                  {index < experiences.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gradient-to-b from-primary to-transparent mt-2"></div>
                  )}
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="flex justify-between items-start gap-4 mb-4 flex-wrap md:flex-nowrap">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-text-primary mb-2">
                        {exp.position[currentLang]}
                      </h3>
                      <p className="text-base md:text-lg text-text-secondary font-medium">
                        {exp.company[currentLang]}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-text-primary bg-white/5 border border-white/10 rounded-lg">
                        {exp.endDate
                          ? t("experience.duration", { months: duration })
                          : t("experience.present")}
                      </span>
                    </div>
                  </div>

                  <p className="text-base text-text-secondary leading-relaxed mb-4">
                    {exp.description[currentLang]}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 border border-primary/20 rounded-md hover:bg-primary/20 transition-colors"
                      >
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

export default ExperienceComponent;
