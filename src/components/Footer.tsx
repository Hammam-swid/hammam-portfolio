import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-bg-primary border-t border-[rgba(255,255,255,0.1)] py-8">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary text-sm">
            {t("footer.copyright", { year: currentYear })}
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-primary bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg hover:bg-primary hover:border-primary hover:text-white transition-all duration-300"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M12 5L5 12M12 5L19 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{t("footer.backToTop")}</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
