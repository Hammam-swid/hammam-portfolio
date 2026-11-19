import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { useLang } from "./hooks/useLang";
import { ScrollTrigger } from "./lib/gsap";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Interactions from "./components/fx/Interactions";
import HomePage from "./pages/HomePage";
import ProjectsPage from "./pages/ProjectsPage";

/** Scroll to top on page change, or to the #section in the URL. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 });
      return;
    }
    // wait for data-driven sections (and pinned spacers) to render
    const id = setTimeout(() => {
      ScrollTrigger.refresh();
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: "smooth" });
    }, 450);
    return () => clearTimeout(id);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { lang, t } = useLang();

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.title = `${t("hero.name")} — ${t("hero.role")}`;
    const id = setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => clearTimeout(id);
  }, [lang, t]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>
      <Interactions />
      <ScrollManager />
      <Navigation />
      <main id="main" className="relative z-[1]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
