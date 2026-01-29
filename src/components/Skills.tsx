import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SkillsService } from "../services/SkillsService";
import type { Skill } from "../types";

const Skills = () => {
  const { t } = useTranslation();
  const [skillsByCategory, setSkillsByCategory] = useState<
    Record<string, Skill[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ["frontend", "backend", "devops", "tools"] as const;

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const skillsData: Record<string, Skill[]> = {};

        for (const category of categories) {
          const data = await SkillsService.getByCategory(category);
          skillsData[category] = data;
        }

        setSkillsByCategory(skillsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load skills");
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  if (loading) {
    return (
      <section
        id="skills"
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
        id="skills"
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
      id="skills"
      className="py-16 md:py-24 bg-[hsl(220,25%,8%)] relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-[hsl(180,60%,50%)]/10 rounded-full blur-3xl top-1/2 right-0 translate-x-1/4"></div>
        <div className="absolute w-[400px] h-[400px] bg-[hsl(190,70%,55%)]/10 rounded-full blur-3xl bottom-0 left-0 -translate-x-1/4"></div>
      </div>

      <div className="container mx-auto px-6 md:px-8 lg:px-12 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[hsl(0,0%,98%)]">
            {t("skills.title")}
          </h2>
          <p className="text-lg text-[hsl(0,0%,75%)] max-w-2xl mx-auto leading-relaxed">
            {t("skills.subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-16">
          {categories.map((category) => {
            const categorySkills = skillsByCategory[category] || [];

            return (
              <div key={category} className="relative group">
                <h3 className="text-2xl md:text-3xl font-bold mb-8 bg-gradient-to-r from-[hsl(180,60%,50%)] to-[hsl(210,55%,45%)] bg-clip-text text-transparent">
                  {t(`skills.categories.${category}`)}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-[hsl(180,60%,50%)]/20 hover:border-[hsl(180,60%,50%)]/30"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-semibold text-[hsl(0,0%,98%)]">
                          {skill.name}
                        </span>
                        <span className="text-sm font-bold text-[hsl(210,55%,45%)]">
                          {skill.level}%
                        </span>
                      </div>

                      <div className="w-full h-2 bg-[hsl(220,15%,16%)] rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-[hsl(210,55%,45%)] to-[hsl(180,60%,50%)] rounded-full relative overflow-hidden transition-all duration-1000 ease-out delay-300 after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:animate-[shimmer_2s_infinite]"
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

      <style>
        {`
          @keyframes shimmer {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(100%);
            }
          }
        `}
      </style>
    </section>
  );
};

export default Skills;
