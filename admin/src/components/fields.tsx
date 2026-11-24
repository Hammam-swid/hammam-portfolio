import { useState } from "react";
import type { ReactNode } from "react";
import { Controller, get, useFormContext } from "react-hook-form";

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function useError(name: string): string | undefined {
  const {
    formState: { errors },
  } = useFormContext();
  return (get(errors, name) as { message?: string } | undefined)?.message;
}

/** English + Arabic side by side for a `{ en, ar }` value. */
export function LocalizedInput({
  name,
  label,
  multiline = false,
  required = false,
  rows = 4,
}: {
  name: string;
  label: string;
  multiline?: boolean;
  required?: boolean;
  rows?: number;
}) {
  const { register } = useFormContext();
  const rules = required ? { required: "Required" } : {};
  const enErr = useError(`${name}.en`);
  const arErr = useError(`${name}.ar`);
  const Tag = multiline ? "textarea" : "input";
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Field label={`${label} · English`} error={enErr}>
        <Tag className="input" rows={multiline ? rows : undefined} {...register(`${name}.en`, rules)} />
      </Field>
      <Field label={`${label} · العربية`} error={arErr}>
        <Tag
          dir="rtl"
          className="input"
          rows={multiline ? rows : undefined}
          {...register(`${name}.ar`, rules)}
        />
      </Field>
    </div>
  );
}

/** A string[] edited as a textarea, one item per line. */
export function LinesInput({
  name,
  label,
  rtl = false,
  rows = 5,
}: {
  name: string;
  label: string;
  rtl?: boolean;
  rows?: number;
}) {
  const { control } = useFormContext();
  return (
    <Field label={label} hint="One item per line">
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <LinesTextarea value={field.value ?? []} onChange={field.onChange} rtl={rtl} rows={rows} />
        )}
      />
    </Field>
  );
}

function LinesTextarea({
  value,
  onChange,
  rtl,
  rows,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  rtl: boolean;
  rows: number;
}) {
  // Keep the raw text locally so blank lines survive while typing.
  const [text, setText] = useState(value.join("\n"));
  return (
    <textarea
      dir={rtl ? "rtl" : undefined}
      className="input"
      rows={rows}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split("\n").map((s) => s.trim()).filter(Boolean));
      }}
    />
  );
}

/** English + Arabic string lists side by side for a `{ en: string[], ar: string[] }` value. */
export function LocalizedLinesInput({ name, label }: { name: string; label: string }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <LinesInput name={`${name}.en`} label={`${label} · English`} />
      <LinesInput name={`${name}.ar`} label={`${label} · العربية`} rtl />
    </div>
  );
}

/** Chips for a string[]; Enter or comma adds, Backspace on empty removes the last one. */
export function TagInput({ name, label, placeholder }: { name: string; label: string; placeholder?: string }) {
  const { control } = useFormContext();
  const [draft, setDraft] = useState("");
  return (
    <Field label={label} hint="Press Enter or comma to add">
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const tags: string[] = field.value ?? [];
          const add = () => {
            const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
            if (parts.length) field.onChange([...tags, ...parts.filter((p) => !tags.includes(p))]);
            setDraft("");
          };
          return (
            <div className="input flex flex-wrap items-center gap-1.5 py-1.5">
              {tags.map((t, i) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-md bg-panel px-2 py-0.5 text-xs">
                  {t}
                  <button
                    type="button"
                    className="text-muted hover:text-danger"
                    aria-label={`Remove ${t}`}
                    onClick={() => field.onChange(tags.filter((_, j) => j !== i))}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                className="min-w-32 flex-1 bg-transparent py-0.5 outline-none"
                value={draft}
                placeholder={placeholder}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={add}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    add();
                  } else if (e.key === "Backspace" && !draft && tags.length) {
                    field.onChange(tags.slice(0, -1));
                  }
                }}
              />
            </div>
          );
        }}
      />
    </Field>
  );
}
