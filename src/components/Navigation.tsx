import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../hooks/useLang";
import { gsap } from "../lib/gsap";
import Icon from "./fx/Icon";
import { CONTACT } from "../lib/contact";

type Item = { key: string; to: string; section?: string };

const ITEMS: Item[] = [
  { key: "about", to: "/#about", section: "about" },
  { key: "projects", to: "/#work" },
  { key: "skills", to: "/#skills", section: "skills" },
  { key: "experience", to: "/#experience", section: "experience" },
  { key: "contact", to: "/#contact", section: "contact" },
];

function readTheme(): "dark" | "light" {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export default function Navigation() {
  const { t, i18n, lang } = useLang();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const [theme, setTheme] = useState<"dark" | "light">(readTheme);
  const linksRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const onHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const current = onHome
    ? active
    : location.pathname.startsWith("/projects")
      ? "projects"
      : "";

  // Track which home section is in view
  useEffect(() => {
    if (!onHome) return;
    const ids = ["hero", "about", "work", "skills", "experience", "contact"];
    const map: Record<string, string> = { hero: "", work: "projects" };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(map[e.target.id] ?? e.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    const t = setTimeout(() => {
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      });
    }, 300);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [onHome, location.pathname]);

  // Slide the highlight pill under the active link
  useLayoutEffect(() => {
    const pill = pillRef.current;
    const link = linksRef.current?.querySelector<HTMLElement>(
      `[data-key="${current}"]`,
    );
    if (!pill) return;
    if (!link) {
      gsap.to(pill, { opacity: 0, duration: 0.2, overwrite: "auto" });
      return;
    }
    gsap.to(pill, {
      x: link.offsetLeft,
      width: link.offsetWidth,
      opacity: 1,
      overwrite: "auto",
      duration: 0.45,
      ease: "power3.out",
    });
  }, [current, lang]);

  // Animate the mobile menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open && overlayRef.current) {
      gsap.fromTo(
        overlayRef.current.querySelectorAll("[data-m]"),
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.06,
          duration: 0.5,
          ease: "power3.out",
        },
      );
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (item: Item) => (e: React.MouseEvent) => {
    setOpen(false);
    if (item.section && onHome) {
      e.preventDefault();
      document
        .getElementById(item.section)
        ?.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", `#${item.section}`);
    } else if (item.section) {
      e.preventDefault();
      navigate(item.to);
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* storage unavailable */
    }
    setTheme(next);
  };

  const toggleLang = () => i18n.changeLanguage(lang === "en" ? "ar" : "en");

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-line bg-[color-mix(in_srgb,var(--bg)_78%,transparent)] py-2.5 backdrop-blur-xl"
          : "border-b border-transparent py-4"
      }`}
    >
      <nav
        aria-label={t("nav.primary")}
        className="container-x flex items-center justify-between gap-4"
      >
        <Link
          to="/"
          aria-label={t("hero.name")}
          className="flex shrink-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <img
            src={theme === "light" ? "lightmode-logo.png" : "/logo.png"}
            alt=""
            className="h-10 w-auto md:h-11"
          />
        </Link>

        <div
          ref={linksRef}
          className="relative hidden items-center gap-1 rounded-full border border-line bg-[color-mix(in_srgb,var(--surface)_60%,transparent)] p-1 lg:flex"
        >
          <span
            ref={pillRef}
            aria-hidden="true"
            className="absolute left-0 top-1 h-[calc(100%-8px)] rounded-full bg-tint opacity-0"
          />
          {ITEMS.map((item) => (
            <Link
              key={item.key}
              data-key={item.key}
              to={item.to}
              onClick={go(item)}
              aria-current={current === item.key ? "page" : undefined}
              className={`relative z-10 rounded-full px-4 py-2 text-[15px] font-medium transition-colors ${
                current === item.key ? "text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {t(`nav.${item.key}`)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={t("nav.switchTheme")}
            className="grid h-11 w-11 place-items-center rounded-xl border border-line text-muted transition-colors hover:border-accent hover:text-accent"
          >
            <Icon name={theme === "dark" ? "sun" : "moon"} />
          </button>
          <button
            type="button"
            onClick={toggleLang}
            aria-label={t("nav.switchLang")}
            className="h-11 min-w-11 rounded-xl border border-line px-3 text-sm font-bold text-muted transition-colors hover:border-accent hover:text-accent"
          >
            {lang === "en" ? "ع" : "EN"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? t("nav.close") : t("nav.menu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid h-11 w-11 place-items-center rounded-xl border border-line text-ink lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} />
          </button>
        </div>
      </nav>

      {/* Portalled to <body>: the header's backdrop-filter would otherwise
          become the containing block for this fixed overlay and collapse it. */}
      {open &&
        createPortal(
          <div
            ref={overlayRef}
            id="mobile-menu"
            className="no-scrollbar fixed inset-0 z-40 flex flex-col overflow-y-auto bg-bg px-6 pb-8 pt-24 lg:hidden"
          >
            <nav aria-label={t("nav.primary")} className="flex flex-col">
              {ITEMS.map((item, i) => (
                <Link
                  key={item.key}
                  data-m
                  to={item.to}
                  onClick={go(item)}
                  aria-current={current === item.key ? "page" : undefined}
                  className={`flex items-baseline gap-4 border-b border-line py-4 text-3xl font-bold ${
                    current === item.key ? "text-accent" : "text-ink"
                  }`}
                >
                  <span dir="ltr" className="font-mono text-sm text-accent">
                    0{i + 1}
                  </span>
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>
            <div data-m className="mt-auto flex flex-col gap-3 pt-10">
              <a
                href={`${CONTACT.whatsapp}?text=${encodeURIComponent(t("contact.whatsappGreeting"))}`}
                target="_blank"
                rel="noreferrer"
                className="btn w-full border border-[#25d366]/60 bg-[#25d366]/10 text-[#25d366]"
              >
                <Icon name="whatsapp" size={18} />
                {t("contact.whatsappChat")}
              </a>
              <a
                href={`mailto:${CONTACT.email}`}
                dir="ltr"
                className="btn btn-ghost w-full"
              >
                <Icon name="mail" size={18} />
                {CONTACT.email}
              </a>
            </div>
          </div>,
          document.body,
        )}
    </header>
  );
}
