import { useFieldArray, useFormContext } from "react-hook-form";
import ResourceList from "../components/ResourceList";
import ResourceForm, { Section } from "../components/ResourceForm";
import { LocalizedInput } from "../components/fields";
import type { SkillGroup } from "../types";

export function SkillsList() {
  return (
    <ResourceList<SkillGroup>
      name="skills"
      title="Skill groups"
      newLabel="New group"
      label={(g) => g.title.en}
      render={(g) => (
        <div className="min-w-0">
          <p className="font-medium">
            {g.title.en} <span className="font-ar text-muted">· {g.title.ar}</span>
          </p>
          <p className="truncate text-sm text-muted">{g.skills.map((s) => s.name).join(", ")}</p>
        </div>
      )}
    />
  );
}

type SkillGroupForm = Omit<SkillGroup, "id" | "skills"> & {
  id?: string;
  skills: { name: string; level: { en: string; ar: string } }[];
};

export function SkillForm() {
  return (
    <ResourceForm<SkillGroupForm>
      name="skills"
      title={(isNew) => (isNew ? "New skill group" : "Edit skill group")}
      empty={{ title: { en: "", ar: "" }, skills: [] }}
      toBody={({ id: _id, ...v }) => ({
        ...v,
        skills: v.skills
          .filter((s) => s.name.trim())
          .map((s) => ({ name: s.name, level: s.level?.en || s.level?.ar ? s.level : undefined })),
      })}
    >
      <Section title="Group">
        <LocalizedInput name="title" label="Title" required />
      </Section>
      <Section title="Skills">
        <SkillRows />
      </Section>
    </ResourceForm>
  );
}

function SkillRows() {
  const { control, register } = useFormContext<SkillGroupForm>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "skills" });
  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1 text-xs text-muted sm:grid">
        <span>Skill</span>
        <span>Level badge · English (optional)</span>
        <span className="text-right">الشارة · العربية (اختياري)</span>
        <span className="w-[108px]" />
      </div>
      {fields.map((f, i) => (
        <div key={f.id} className="grid gap-2 rounded-lg border border-line p-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:border-0 sm:p-0">
          <input className="input" placeholder="e.g. React.js" {...register(`skills.${i}.name`)} />
          <input className="input" placeholder="e.g. Basic" {...register(`skills.${i}.level.en`)} />
          <input className="input" dir="rtl" placeholder="مثال: أساسي" {...register(`skills.${i}.level.ar`)} />
          <div className="flex gap-1.5">
            <button type="button" className="btn-icon" disabled={i === 0} onClick={() => move(i, i - 1)}>
              ↑
            </button>
            <button type="button" className="btn-icon" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)}>
              ↓
            </button>
            <button type="button" className="btn-icon hover:text-danger" onClick={() => remove(i)}>
              ✕
            </button>
          </div>
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={() => append({ name: "", level: { en: "", ar: "" } })}>
        + Add skill
      </button>
    </div>
  );
}
