import { useTranslation } from "react-i18next";
import "./Footer.css";

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p className="footer-copyright">
            {t("footer.copyright", { year: currentYear })}
          </p>

          <button onClick={scrollToTop} className="back-to-top">
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
