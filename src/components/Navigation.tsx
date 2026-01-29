import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import gsap from "gsap";

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
    <nav
      className={`fixed top-0 left-0 w-full z-[200] py-4 transition-all duration-300 ease-out ${
        isScrolled
          ? "bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] border-b border-[rgba(255,255,255,0.1)] shadow-lg py-3"
          : ""
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="font-display text-2xl md:text-3xl font-bold cursor-pointer transition-transform duration-300 ease-out hover:scale-105">
            <button
              onClick={() => scrollToSection("hero")}
              className="bg-transparent border-0 cursor-pointer"
            >
              <img src="/logo.png" alt="logo" className="h-[60px]" />
            </button>
          </div>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-6 lg:gap-8 list-none m-0 p-0">
            {navItems.map((item) => (
              <li key={item.key}>
                <button
                  onClick={() => scrollToSection(item.id)}
                  className="group bg-transparent border-none text-text-secondary font-primary text-base font-medium cursor-pointer px-3 py-2 relative transition-colors duration-300 ease-out hover:text-text-primary after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-0.5 after:bg-gradient-to-r after:from-primary after:to-secondary after:transition-all after:duration-300 hover:after:w-full"
                >
                  {t(`nav.${item.key}`)}
                </button>
              </li>
            ))}
          </ul>

          {/* Language Toggle & Mobile Menu Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 text-sm font-semibold rounded-md bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-text-primary transition-all duration-300 ease-out hover:bg-gradient-to-r hover:from-primary hover:to-secondary hover:border-transparent hover:shadow-[0_0_20px_rgba(66,135,245,0.4)]"
              aria-label="Toggle Language"
            >
              {currentLanguage === "en" ? "AR" : "EN"}
            </button>

            <button
              onClick={toggleMobileMenu}
              className="md:hidden bg-transparent border-none p-2 cursor-pointer"
              aria-label="Toggle Menu"
            >
              <span className="flex flex-col gap-[5px] w-6">
                <span
                  className={`block w-full h-0.5 bg-text-primary transition-all duration-300 ease-out ${
                    isMobileMenuOpen ? "rotate-45 translate-y-[7px]" : ""
                  }`}
                ></span>
                <span
                  className={`block w-full h-0.5 bg-text-primary transition-all duration-300 ease-out ${
                    isMobileMenuOpen ? "opacity-0" : ""
                  }`}
                ></span>
                <span
                  className={`block w-full h-0.5 bg-text-primary transition-all duration-300 ease-out ${
                    isMobileMenuOpen ? "-rotate-45 -translate-y-[7px]" : ""
                  }`}
                ></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden nav-mobile-menu py-6 mt-4 bg-[rgba(255,255,255,0.05)] backdrop-blur-[20px] rounded-lg border border-[rgba(255,255,255,0.1)]">
            <ul className="flex flex-col gap-2 list-none m-0 p-0">
              {navItems.map((item) => (
                <li key={item.key}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-center px-3 py-3 text-lg bg-transparent border-none text-text-secondary font-primary font-medium cursor-pointer transition-colors duration-300 ease-out hover:text-text-primary"
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
