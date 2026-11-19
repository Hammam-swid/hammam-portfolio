import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../hooks/useLang";
import { gsap, useGSAP, MOTION_OK } from "../../lib/gsap";
import Magnetic from "../fx/Magnetic";
import Icon from "../fx/Icon";

const FILES: Record<string, string> = {
  "about.ts": `const hammam = {
  role: "Full-stack Developer",
  experience: "2 years",
  based: "Tripoli, Libya",
  ledTeam: "Training & Courses System",
  speaks: ["Arabic", "English"],
};`,
  "stack.json": `{
  "frontend": ["React", "TypeScript", "Redux"],
  "styling":  ["Tailwind CSS", "shadcn/ui"],
  "backend":  ["Node.js", "Express", "ASP.NET"],
  "data":     ["MySQL", "TypeORM", "MongoDB"],
  "learning": ["Nest.js", "Docker"]
}`,
  "now.sh": `$ whoami
hammam-swaid
$ status --current
> Freelance full-stack developer
> Open to new roles & projects
$ contact --email
hmam.swid@gmail.com`,
};

/** Tiny highlighter: strings, keys and prompts get their own color. */
function Code({ text }: { text: string }) {
  const re = /("[^"\n]*"?)|(\$ |> )|(\bconst\b)|(\w+)(?=:)/g;
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(re)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    const cls = m[1]
      ? "text-[#93c2db]"
      : m[2]
        ? "text-[#4e9bc4]"
        : m[3]
          ? "text-[#c3a6ff]"
          : "text-[#f0c27b]";
    out.push(
      <span key={at} className={cls}>
        {m[0]}
      </span>,
    );
    last = at + m[0].length;
  }
  out.push(text.slice(last));
  return <>{out}</>;
}

function Terminal() {
  const { t } = useLang();
  const names = Object.keys(FILES);
  const [file, setFile] = useState(names[0]);
  const calm = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [count, setCount] = useState(() => (calm() ? Infinity : 0));
  const full = FILES[file];
  const typed = full.slice(0, count);
  const done = count >= full.length;

  const select = (n: string) => {
    setFile(n);
    setCount(calm() ? Infinity : 0);
  };

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setCount((c) => c + 2), 22);
    return () => clearInterval(id);
  }, [done, file]);

  return (
    <div
      dir="ltr"
      data-hero="card"
      className="spot w-full overflow-hidden !rounded-2xl text-left text-ink shadow-[var(--shadow)] [--accent:#71aecf] [--border:#252c5c] [--ink-faint:#8f91a8] [--ink:#f0f1f2] [--surface:#121636] [--tint-ink:#b6d6e7] [--tint:rgba(78,155,196,0.16)]"
    >
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#e26b6b]" />
        <span className="h-3 w-3 rounded-full bg-[#e0b04f]" />
        <span className="h-3 w-3 rounded-full bg-[#4fbf87]" />
        <div
          role="tablist"
          aria-label={t("hero.terminalHint")}
          className="ms-3 flex gap-1 overflow-x-auto"
        >
          {names.map((n) => (
            <button
              key={n}
              role="tab"
              type="button"
              aria-selected={file === n}
              onClick={() => select(n)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs transition-colors ${
                file === n
                  ? "bg-tint text-tint-ink"
                  : "text-faint hover:text-ink"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <pre className="m-0 min-h-[236px] overflow-x-auto p-5 font-mono text-[13px] leading-6 text-ink md:text-sm">
        <code className={done ? "" : "caret"}>
          <Code text={typed} />
        </code>
      </pre>
      <div className="border-t border-line px-5 py-2 font-mono text-[11px] text-faint">
        {t("hero.terminalHint")} ↑
      </div>
    </div>
  );
}

export default function Hero() {
  const { t, lang } = useLang();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        // Intro
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from("[data-hero='eyebrow']", { y: 20, autoAlpha: 0, duration: 0.6 })
          .from(
            "[data-hero='word']",
            { yPercent: 110, duration: 1, stagger: 0.12 },
            "-=0.3",
          )
          .from(
            "[data-hero='fade']",
            { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 },
            "-=0.6",
          )
          .from(
            "[data-hero='card']",
            { y: 60, rotateX: 18, autoAlpha: 0, duration: 1.1 },
            "-=0.9",
          );

        // Scroll-out: content drifts up and fades, orbs move at different speeds
        gsap.to("[data-hero='content']", {
          yPercent: -18,
          autoAlpha: 0.15,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        gsap.utils.toArray<HTMLElement>("[data-orb]").forEach((orb, i) => {
          gsap.to(orb, {
            y: (i + 1) * 120,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        });

        // Orbs follow the pointer a little
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          gsap.utils
            .toArray<HTMLElement>("[data-orb-inner]")
            .forEach((o, i) => {
              gsap.to(o, {
                x: nx * 60 * (i + 1),
                y: ny * 40 * (i + 1),
                duration: 1.2,
                ease: "power3.out",
              });
            });
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [lang], revertOnUpdate: true },
  );

  const nameWords = t("hero.name").split(" ");

  return (
    <section
      ref={root}
      id="hero"
      className="noise relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32"
    >
      {/* Ambient orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          data-orb
          className="absolute -top-40 start-[-10%] h-[520px] w-[520px]"
        >
          <div
            data-orb-inner
            className="h-full w-full rounded-full opacity-60 blur-3xl"
            style={{
              background: "radial-gradient(circle, #24487d, transparent 70%)",
            }}
          />
        </div>
        <div
          data-orb
          className="absolute top-1/3 end-[-12%] h-[620px] w-[620px]"
        >
          <div
            data-orb-inner
            className="h-full w-full rounded-full opacity-50 blur-3xl"
            style={{
              background: "radial-gradient(circle, #2b87b8, transparent 70%)",
            }}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-bg to-transparent" />
      </div>

      <div className="container-x relative z-10 grid items-center gap-14 lg:grid-cols-[1.25fr_1fr]">
        <div data-hero="content" className="flex flex-col gap-6">
          <span
            data-hero="eyebrow"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5 text-sm text-muted backdrop-blur"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4fbf87] opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4fbf87]" />
            </span>
            {t("hero.eyebrow")}
          </span>

          <div>
            <p
              data-hero="fade"
              className="m-0 mb-2 text-lg font-medium text-muted md:text-xl"
            >
              {t("hero.greeting")}
            </p>
            <h1 className="m-0 text-[52px] font-black leading-[1.12] tracking-tight sm:text-[72px] lg:text-[88px]">
              {nameWords.map((w, i) => (
                <span
                  key={i}
                  className={`inline-block overflow-hidden pb-2 align-bottom ${i < nameWords.length - 1 ? "me-[0.28em]" : ""}`}
                >
                  <span
                    data-hero="word"
                    className={`inline-block ${i === nameWords.length - 1 ? "text-gradient" : ""}`}
                  >
                    {w}
                  </span>
                </span>
              ))}
            </h1>
            <p
              data-hero="fade"
              className="m-0 mt-2 text-2xl font-light text-ink/90 md:text-3xl"
            >
              {t("hero.role")}
            </p>
          </div>

          <p data-hero="fade" className="m-0 max-w-xl text-lg text-muted">
            {t("hero.subtitle")}
          </p>

          <div data-hero="fade" className="mt-2 flex flex-wrap gap-3">
            <Magnetic>
              <Link to="/projects" className="btn btn-primary">
                {t("hero.cta.primary")}
                <Icon name="arrow" className="rtl:-scale-x-100" />
              </Link>
            </Magnetic>
            <Magnetic>
              <a href="#contact" className="btn btn-ghost">
                {t("hero.cta.secondary")}
              </a>
            </Magnetic>
          </div>
        </div>

        <div style={{ perspective: 1200 }}>
          <Terminal />
        </div>
      </div>

      <a
        href="#about"
        aria-label={t("hero.scrollDown")}
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs text-faint md:flex [@media(max-height:860px)]:!hidden"
      >
        <span className="flex h-10 w-6 justify-center rounded-full border border-line-strong pt-2">
          <span
            className="h-2 w-1 rounded-full bg-accent"
            style={{ animation: "scroll-dot 1.8s ease-in-out infinite" }}
          />
        </span>
        {t("hero.scrollDown")}
      </a>
    </section>
  );
}
