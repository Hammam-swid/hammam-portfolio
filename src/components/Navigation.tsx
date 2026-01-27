import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";
import "./Navigation.css";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentLanguage = i18n.language;
  const isRTL = currentLanguage === "ar";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Set HTML dir attribute for RTL
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = currentLanguage;
  }, [isRTL, currentLanguage]);

  const toggleLanguage = () => {
    const newLang = currentLanguage === "en" ? "ar" : "en";
    i18n.changeLanguage(newLang);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);

    if (!isMobileMenuOpen) {
      gsap.from(".nav-mobile-menu", {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { key: "home", id: "hero" },
    { key: "projects", id: "projects" },
    { key: "skills", id: "skills" },
    { key: "experience", id: "experience" },
    { key: "contact", id: "contact" },
  ];

  return (
    <nav className={`navigation ${isScrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="nav-content">
          {/* Logo */}
          <div className="nav-logo">
            <img src="/logo.png" alt="logo" style={{ height: "60px" }} />
          </div>

          {/* Desktop Navigation */}
          <ul className="nav-links hide-mobile">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className="nav-link"
                >
                  {t(`nav.${item.key}`)}
                </button>
              </li>
            ))}
          </ul>

          {/* Language Toggle & Mobile Menu Button */}
          <div className="nav-actions">
            <button
              onClick={toggleLanguage}
              className="btn lang-toggle"
              aria-label="Toggle Language"
            >
              {currentLanguage === "en" ? "AR" : "EN"}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="mobile-menu-btn hide-desktop"
              aria-label="Toggle Menu"
            >
              <span className={`hamburger ${isMobileMenuOpen ? "open" : ""}`}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="nav-mobile-menu hide-desktop">
            <ul>
              {navItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="nav-link"
                  >
                    {t(`nav.${item.key}`)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
