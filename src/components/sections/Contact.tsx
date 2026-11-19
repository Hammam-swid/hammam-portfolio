import { useState } from "react";
import { useForm } from "react-hook-form";
import { useLang } from "../../hooks/useLang";
import { gsap } from "../../lib/gsap";
import Reveal from "../fx/Reveal";
import SectionHeading from "../fx/SectionHeading";
import Magnetic from "../fx/Magnetic";
import Icon, { type IconName } from "../fx/Icon";
import { CONTACT } from "../../lib/contact";


type FormValues = { name: string; email: string; message: string };

export default function Contact() {
  const { t } = useLang();
  const [toast, setToast] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const flash = (msg: string) => {
    setToast(msg);
    gsap.fromTo("#toast", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: "back.out(2)" });
    window.setTimeout(() => setToast(null), 2200);
  };

  const copy = async (value: string, el: HTMLElement) => {
    try {
      await navigator.clipboard.writeText(value);
      flash(t("contact.copied"));
      gsap.fromTo(el, { scale: 0.9 }, { scale: 1, duration: 0.5, ease: "elastic.out(1,0.4)" });
    } catch {
      /* clipboard blocked: the visible link still works */
    }
  };

  const onSubmit = (v: FormValues) => {
    const subject = encodeURIComponent(`Portfolio — ${v.name}`);
    const body = encodeURIComponent(`${v.message}\n\n— ${v.name} (${v.email})`);
    flash(t("contact.form.opening"));
    window.location.assign(`mailto:${CONTACT.email}?subject=${subject}&body=${body}`);
  };

  const info: { icon: IconName; label: string; value: string; href: string; copy: string }[] = [
    { icon: "mail", label: t("contact.info.email"), value: CONTACT.email, href: `mailto:${CONTACT.email}`, copy: CONTACT.email },
    {
      icon: "whatsapp",
      label: t("contact.info.whatsapp"),
      value: CONTACT.phoneDisplay,
      href: `${CONTACT.whatsapp}?text=${encodeURIComponent(t("contact.whatsappGreeting"))}`,
      copy: CONTACT.phone,
    },
    { icon: "phone", label: t("contact.info.phone"), value: CONTACT.phoneDisplay, href: `tel:${CONTACT.phone}`, copy: CONTACT.phone },
  ];

  const onWhatsApp = (v: FormValues) => {
    const text = `${v.message}\n\n— ${v.name} (${v.email})`;
    window.open(`${CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <Reveal as="section" id="contact" className="relative overflow-hidden bg-bg-2 py-24 md:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 start-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-40 blur-3xl" style={{ background: "radial-gradient(ellipse,#2b87b8,transparent 70%)" }} />
      <div className="container-x relative grid gap-12 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex flex-col gap-8">
          <SectionHeading label={t("contact.label")} title={t("contact.title")} subtitle={t("contact.subtitle")} />

          <div className="flex flex-col gap-3">
            {info.map((it, i) => (
              <div key={it.icon} data-reveal={i} className="spot flex items-center gap-4 p-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-tint text-tint-ink">
                  <Icon name={it.icon} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-faint">{it.label}</div>
                  <a
                    dir="ltr"
                    href={it.href}
                    {...(it.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="relative z-[3] block truncate text-lg font-medium text-ink hover:text-accent">
                    {it.value}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={(e) => copy(it.copy, e.currentTarget)}
                  aria-label={`${t("contact.copy")} ${it.label}`}
                  className="relative z-[3] grid h-11 w-11 place-items-center rounded-xl border border-line text-muted transition hover:border-accent hover:text-accent"
                >
                  <Icon name="copy" size={18} />
                </button>
              </div>
            ))}
            <div data-reveal="3" className="flex items-center gap-4 px-4 py-2 text-muted">
              <Icon name="pin" />
              {t("about.location")}
            </div>
          </div>

          <div data-reveal="4" className="flex flex-col gap-3">
            <span className="text-sm text-faint">{t("contact.social")}</span>
            <div className="flex flex-wrap gap-3">
              <Magnetic>
                <a
                  className="btn btn-ghost"
                  href={`${CONTACT.whatsapp}?text=${encodeURIComponent(t("contact.whatsappGreeting"))}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Icon name="whatsapp" size={18} /> {t("contact.info.whatsapp")}
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn-ghost" href={CONTACT.github} target="_blank" rel="noreferrer">
                  <Icon name="github" size={18} /> GitHub
                </a>
              </Magnetic>
              <Magnetic>
                <a className="btn btn-ghost" href={CONTACT.linkedin} target="_blank" rel="noreferrer">
                  <Icon name="linkedin" size={18} /> LinkedIn
                </a>
              </Magnetic>
            </div>
          </div>
        </div>

        <form
          data-reveal="1"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="spot flex flex-col gap-5 p-5 md:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="c-name" label={t("contact.form.name")} error={errors.name?.message}>
              <input
                id="c-name"
                className="field"
                autoComplete="name"
                aria-invalid={!!errors.name}
                {...register("name", { required: t("contact.form.required") })}
              />
            </Field>
            <Field id="c-email" label={t("contact.form.email")} error={errors.email?.message}>
              <input
                id="c-email"
                type="email"
                dir="ltr"
                className="field"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email", {
                  required: t("contact.form.required"),
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: t("contact.form.invalidEmail") },
                })}
              />
            </Field>
          </div>
          <Field id="c-msg" label={t("contact.form.message")} error={errors.message?.message}>
            <textarea
              id="c-msg"
              rows={6}
              className="field resize-y"
              aria-invalid={!!errors.message}
              {...register("message", { required: t("contact.form.required") })}
            />
          </Field>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Magnetic className="w-full sm:w-auto">
              <button type="submit" className="btn btn-primary w-full px-8">
                {t("contact.form.send")}
                <Icon name="arrow" size={18} className="rtl:-scale-x-100" />
              </button>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <button
                type="button"
                onClick={handleSubmit(onWhatsApp)}
                className="btn w-full border border-[#25d366]/60 bg-[#25d366]/10 text-[#25d366] hover:bg-[#25d366]/20"
              >
                <Icon name="whatsapp" size={18} />
                {t("contact.form.sendWhatsapp")}
              </button>
            </Magnetic>
          </div>
        </form>
      </div>

      <div
        id="toast"
        role="status"
        className={`fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-bg shadow-[var(--shadow)] ${toast ? "" : "invisible"}`}
      >
        <Icon name="check" size={16} />
        {toast}
      </div>
    </Reveal>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="relative z-[3] flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <span role="alert" className="text-sm text-[#e26b6b]">
          {error}
        </span>
      )}
    </div>
  );
}
