import { useLang } from "../../hooks/useLang";
import { useAsync } from "../../hooks/useAsync";
import { ProjectsService, SkillsService } from "../../services/data";
import Reveal from "../fx/Reveal";
import Counter from "../fx/Counter";
import SectionHeading from "../fx/SectionHeading";
import Icon from "../fx/Icon";

export default function About() {
  const { t } = useLang();
  const { data: projects } = useAsync(ProjectsService.getAll);
  const { data: skills } = useAsync(SkillsService.getAll);
  const techCount = skills?.reduce((n, g) => n + g.skills.length, 0) ?? 0;

  const stats = [
    { value: 2, suffix: "+", label: t("stats.years") },
    { value: projects?.length ?? 5, suffix: "", label: t("stats.projects") },
    { value: 1, suffix: "", label: t("stats.team") },
    { value: techCount || 29, suffix: "+", label: t("stats.stack") },
  ];

  const facts = [
    { icon: "pin" as const, text: t("about.location") },
    { icon: "layers" as const, text: t("about.languages") },
    { icon: "check" as const, text: t("about.soft") },
  ];

  return (
    <Reveal as="section" id="about" className="relative py-24 md:py-32" deps={[techCount]}>
      <div className="container-x grid gap-14 lg:grid-cols-[1.1fr_1fr] lg:items-end">
        <div className="flex flex-col gap-8">
          <SectionHeading label={t("about.label")} title={t("about.title")} />
          <p data-reveal="2" className="m-0 max-w-2xl text-lg leading-[1.9] text-muted md:text-xl">
            {t("about.body")}
          </p>
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {facts.map((f, i) => (
              <li key={f.icon} data-reveal={3 + i} className="flex items-center gap-3 text-ink">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-tint text-tint-ink">
                  <Icon name={f.icon} size={18} />
                </span>
                {f.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={i} data-reveal={i} className="spot flex flex-col gap-2 p-6 md:p-8">
              <span className="text-gradient text-5xl font-black leading-none md:text-6xl">
                <Counter to={s.value} suffix={s.suffix} />
              </span>
              <span className="text-[15px] leading-6 text-muted">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
