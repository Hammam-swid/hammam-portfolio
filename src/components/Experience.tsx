import { useTranslation } from "react-i18next";
import { experiences, getExperienceDuration } from "../data/experiences";

const Experience = () => {
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language as "en" | "ar";

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
            const duration = getExperienceDuration(exp.startDate, exp.endDate);

            return (
              <div
                key={exp.id}
                className="grid grid-cols-[auto_1fr] gap-6 md:gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center relative">
                  <div className="w-5 h-5 md:w-5 md:h-5 bg-linear-to-r from-primary to-secondary rounded-full border-[3px] border-bg-secondary shadow-[0_0_20px_rgba(66,135,245,0.4)] z-10"></div>
                  {index < experiences.length - 1 && (
                    <div className="w-0.5 flex-1 bg-linear-to-b from-primary to-transparent mt-2"></div>
                  )}
                </div>

                <div className="p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:border-[hsl(210,55%,45%)]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[hsl(210,55%,45%)]/10">
                  <div className="flex justify-between items-start gap-4 mb-4 flex-wrap md:flex-nowrap">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-[hsl(0,0%,98%)] mb-2">
                        {exp.position[currentLang]}
                      </h3>
                      <p className="text-base md:text-lg text-[hsl(0,0%,75%)] font-medium">
                        {exp.company[currentLang]}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <span className="inline-flex items-center px-4 py-2 text-sm font-semibold text-[hsl(0,0%,98%)] bg-white/5 border border-white/10 rounded-lg">
                        {exp.endDate
                          ? t("experience.duration", { months: duration })
                          : t("experience.present")}
                      </span>
                    </div>
                  </div>

                  <p className="text-base text-[hsl(0,0%,75%)] leading-relaxed mb-4">
                    {exp.description[currentLang]}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {exp.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="px-3 py-1 text-sm font-medium text-[hsl(210,55%,45%)] bg-[hsl(210,55%,45%)]/10 border border-[hsl(210,55%,45%)]/20 rounded-md hover:bg-[hsl(210,55%,45%)]/20 transition-colors"
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

export default Experience;
