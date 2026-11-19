export default function SectionHeading({
  label,
  title,
  subtitle,
  align = "start",
}: {
  label: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
}) {
  return (
    <div
      className={`flex max-w-2xl flex-col gap-3 ${align === "center" ? "mx-auto items-center text-center" : ""}`}
    >
      <span data-reveal className="eyebrow">
        {label}
      </span>
      <h2
        data-reveal="1"
        className="m-0 text-[32px] font-bold leading-[1.3] tracking-tight md:text-[44px]"
      >
        {title}
      </h2>
      {subtitle && (
        <p data-reveal="2" className="m-0 text-lg text-muted">
          {subtitle}
        </p>
      )}
    </div>
  );
}
