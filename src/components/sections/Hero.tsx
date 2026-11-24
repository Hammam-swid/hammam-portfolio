import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../../hooks/useLang";
import { gsap, useGSAP, MOTION_OK } from "../../lib/gsap";
import Letters from "../fx/Letters";
import Magnetic from "../fx/Magnetic";
import Constellation, { type ConstellationHandle } from "../fx/Constellation";
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

  const tabsRef = useRef<HTMLDivElement>(null);
  const select = (n: string) => {
    if (n === file) return;
    setFile(n);
    setCount(calm() ? Infinity : 0);
  };
  // Arrow keys / Home / End move between tabs (standard tablist keyboard pattern)
  const onTabKey = (e: React.KeyboardEvent) => {
    const i = names.indexOf(file);
    const next =
      e.key === "ArrowRight" ? (i + 1) % names.length
      : e.key === "ArrowLeft" ? (i - 1 + names.length) % names.length
      : e.key === "Home" ? 0
      : e.key === "End" ? names.length - 1
      : -1;
    if (next < 0) return;
    e.preventDefault();
    select(names[next]);
    tabsRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus({ preventScroll: true });
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
          ref={tabsRef}
          role="tablist"
          aria-label={t("hero.terminalHint")}
          onKeyDown={onTabKey}
          className="no-scrollbar ms-3 flex min-w-0 gap-1 overflow-x-auto"
        >
          {names.map((n) => (
            <button
              key={n}
              id={`term-tab-${n}`}
              role="tab"
              type="button"
              aria-selected={file === n}
              aria-controls="term-panel"
              tabIndex={file === n ? 0 : -1}
              onClick={() => select(n)}
              className={`shrink-0 cursor-pointer rounded-md px-3 py-2 font-mono text-xs transition-colors ${
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
      <pre
        id="term-panel"
        role="tabpanel"
        aria-labelledby={`term-tab-${file}`}
        className="m-0 min-h-[236px] overflow-x-auto p-5 font-mono text-[13px] leading-6 text-ink md:text-sm"
      >
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

  const field = useRef<ConstellationHandle>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const h1 = root.current!.querySelector<HTMLElement>("[data-hero='name']")!;
        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.from("[data-hero='eyebrow']", { y: 20, autoAlpha: 0, duration: 0.6 });

        // Letters fly in from scattered positions and assemble the name
        // (Arabic too: each letter keeps its joined shape, see Letters).
        tl.from(
          h1.querySelectorAll("[data-letter]"),
          {
            x: () => gsap.utils.random(-260, 260),
            y: () => gsap.utils.random(-180, 180),
            rotate: () => gsap.utils.random(-90, 90),
            scale: () => gsap.utils.random(0.3, 1.8),
            autoAlpha: 0,
            filter: "blur(8px)",
            duration: 1.4,
            stagger: { each: 0.04, from: "random" },
          },
          "-=0.3",
        );
        tl.from("[data-hero='fade']", { y: 24, autoAlpha: 0, duration: 0.8, stagger: 0.1 }, "-=0.9").fromTo(
          "[data-hero='float']",
          { y: 80, z: -200, rotateX: 25, autoAlpha: 0 },
          { y: 0, z: 0, rotateX: 0, autoAlpha: 1, duration: 1.3 },
          "-=1",
        );

        // Terminal floats on its own and leans toward the pointer.
        const card = root.current!.querySelector<HTMLElement>("[data-hero='card']")!;
        const bob = gsap.to(card, { y: -12, rotateY: -4, duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
        const tiltX = gsap.quickTo("[data-hero='tilt']", "rotateX", { duration: 0.9, ease: "power3" });
        const tiltY = gsap.quickTo("[data-hero='tilt']", "rotateY", { duration: 0.9, ease: "power3" });
        let steady = false;
        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse" || steady) return;
          tiltY((e.clientX / window.innerWidth - 0.5) * 16);
          tiltX(-(e.clientY / window.innerHeight - 0.5) * 12);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        // Hold the card still while the pointer is on it, so tabs stay where you aim.
        const hold = () => {
          steady = true;
          bob.pause();
          gsap.to(card, { y: 0, rotateY: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
          tiltX(0);
          tiltY(0);
        };
        const release = () => {
          steady = false;
          bob.play();
        };
        card.addEventListener("pointerenter", hold);
        card.addEventListener("pointerleave", release);
        card.addEventListener("focusin", hold);
        card.addEventListener("focusout", release);

        // Scroll-out: content recedes, terminal falls back in depth, particles scatter.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              onUpdate: (self) => field.current?.scatter(self.progress),
            },
            defaults: { ease: "none" },
          })
          // Explicit start values, and the terminal's scroll-out lives on its own wrapper
          // ([data-hero='out']), so scrolling back up always returns to fully visible
          // instead of whatever the intro was showing when this was created.
          .fromTo(
            "[data-hero='content']",
            { yPercent: 0, scale: 1, autoAlpha: 1, filter: "blur(0px)" },
            { yPercent: -14, scale: 0.9, autoAlpha: 0.1, filter: "blur(6px)" },
            0,
          )
          .fromTo(
            "[data-hero='out']",
            { yPercent: 0, z: 0, rotateX: 0, autoAlpha: 1 },
            { yPercent: 30, z: -320, rotateX: 18, autoAlpha: 0.2 },
            0,
          )
          .to("[data-orb]", { y: 160 }, 0);

        return () => {
          window.removeEventListener("pointermove", onMove);
          card.removeEventListener("pointerenter", hold);
          card.removeEventListener("pointerleave", release);
          card.removeEventListener("focusin", hold);
          card.removeEventListener("focusout", release);
          bob.kill();
          field.current?.scatter(0);
        };
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
      className="noise relative flex min-h-[100svh] items-center overflow-clip pb-24 pt-32"
    >
      {/* Ambient glow + particle network */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          data-orb
          className="absolute top-1/4 end-[-12%] h-[620px] w-[620px] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #2b87b8, transparent 70%)" }}
        />
        <Constellation ref={field} className="absolute inset-0 h-full w-full" />
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
            <h1
              data-hero="name"
              aria-label={t("hero.name")}
              className="m-0 text-[52px] font-black leading-[1.12] tracking-tight rtl:tracking-normal sm:text-[72px] lg:text-[88px]"
            >
              {nameWords.map((w, i) => (
                <span
                  key={`${lang}-${w}`}
                  aria-hidden="true"
                  className={`inline-block pb-2 align-bottom ${i < nameWords.length - 1 ? "me-[0.28em]" : ""}`}
                >
                  <Letters text={w} gradient={i === nameWords.length - 1} />
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
          <div data-hero="out" style={{ transformStyle: "preserve-3d" }}>
            <div data-hero="float" style={{ transformStyle: "preserve-3d" }}>
              <div data-hero="tilt" style={{ transformStyle: "preserve-3d" }}>
                <Terminal />
              </div>
            </div>
          </div>
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
