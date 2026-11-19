import { Link } from "react-router-dom";
import { useLang } from "../hooks/useLang";
import Icon from "./fx/Icon";
import Magnetic from "./fx/Magnetic";
import { CONTACT } from "../lib/contact";

export default function Footer() {
  const { t } = useLang();
  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg">
      <div className="container-x flex flex-col gap-10 py-14">
        <a
          href={`mailto:${CONTACT.email}`}
          dir="ltr"
          className="group block w-fit text-[clamp(28px,6vw,80px)] font-black leading-none tracking-tight rtl:ms-auto"
        >
          <span className="text-gradient">hmam.swid</span>
          <span className="text-faint transition-colors group-hover:text-accent">
            @gmail.com
          </span>
        </a>
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img
              loading="lazy"
              src="/logo.png"
              alt={t("hero.name")}
              className="h-10 w-auto"
            />
          </Link>
          <div className="flex flex-col gap-1 text-sm text-faint">
            <p className="m-0">
              {t("footer.copyright", { year: new Date().getFullYear() })}
            </p>
            <p className="m-0">{t("footer.built")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Magnetic>
              <a
                href={`${CONTACT.whatsapp}?text=${encodeURIComponent(t("contact.whatsappGreeting"))}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-ghost"
              >
                <Icon name="whatsapp" size={18} />
                {t("contact.whatsappChat")}
              </a>
            </Magnetic>
            <Magnetic>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="btn btn-ghost"
              >
                <Icon name="arrowUp" size={18} />
                {t("footer.backToTop")}
              </button>
            </Magnetic>
          </div>
        </div>
      </div>
    </footer>
  );
}
