import { useFormContext } from "react-hook-form";
import ResourceList from "../components/ResourceList";
import ResourceForm, { Section } from "../components/ResourceForm";
import { Field, LocalizedInput, LocalizedLinesInput, TagInput } from "../components/fields";
import type { Experience } from "../types";

const KINDS = [
  { value: "job", label: "Job" },
  { value: "freelance", label: "Freelance" },
  { value: "education", label: "Education" },
];

export function ExperiencesList() {
  return (
    <ResourceList<Experience>
      name="experiences"
      title="Experience"
      newLabel="New entry"
      label={(x) => x.company.en}
      render={(x) => (
        <div className="min-w-0">
          <p className="truncate font-medium">
            {x.position.en || x.company.en}
            {x.position.en && <span className="text-muted"> · {x.company.en}</span>}
          </p>
          <p className="text-xs text-muted">
            {x.kind} · {x.startDate ?? "—"} → {x.endDate ?? "present"}
          </p>
        </div>
      )}
    />
  );
}

type ExperienceForm = Omit<Experience, "id" | "location"> & {
  id?: string;
  location: { en: string; ar: string };
};

export function ExperienceForm() {
  return (
    <ResourceForm<ExperienceForm>
      name="experiences"
      title={(isNew) => (isNew ? "New experience" : "Edit experience")}
      empty={{
        kind: "job",
        company: { en: "", ar: "" },
        position: { en: "", ar: "" },
        bullets: { en: [], ar: [] },
        startDate: "",
        endDate: "",
        technologies: [],
        location: { en: "", ar: "" },
      }}
      toBody={({ id: _id, ...v }) => v}
    >
      <Section title="Role">
        <KindAndDates />
        <LocalizedInput name="company" label="Company / school" required />
        <LocalizedInput name="position" label="Position / degree" />
        <LocalizedInput name="location" label="Location / type" />
      </Section>
      <Section title="Details">
        <LocalizedLinesInput name="bullets" label="Bullet points" />
        <TagInput name="technologies" label="Technologies" />
      </Section>
    </ResourceForm>
  );
}

function KindAndDates() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ExperienceForm>();
  const month = { pattern: { value: /^(\d{4}-(0[1-9]|1[0-2]))?$/, message: "Use YYYY-MM" } };
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Field label="Type">
        <select className="input" {...register("kind")}>
          {KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Start (YYYY-MM)" error={errors.startDate?.message}>
        <input className="input" type="month" {...register("startDate", month)} />
      </Field>
      <Field label="End (YYYY-MM)" hint="Leave empty for “present”" error={errors.endDate?.message}>
        <input className="input" type="month" {...register("endDate", month)} />
      </Field>
    </div>
  );
}
