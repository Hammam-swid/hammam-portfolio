import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { DefaultValues, FieldValues } from "react-hook-form";
import { Link, useBlocker, useNavigate, useParams } from "react-router-dom";
import { errorMessage, resources } from "../lib/api";
import type { ResourceName } from "../types";
import { ErrorBox, PageHeader } from "./Layout";

/**
 * Loads `/:id` (or starts empty for `/new`), renders `children` inside a
 * react-hook-form context and saves via the API.
 * `toBody` turns form values into the request body (e.g. trims empty fields).
 */
export default function ResourceForm<T extends FieldValues & { id?: string }>({
  name,
  title,
  empty,
  toBody = (v) => v,
  children,
}: {
  name: ResourceName;
  title: (isNew: boolean) => string;
  empty: DefaultValues<T>;
  toBody?: (values: T) => unknown;
  children: ReactNode;
}) {
  const { id = "new" } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();
  const form = useForm<T>({ defaultValues: empty });
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isNew) return;
    resources
      .get<T>(name, id)
      .then((data) => form.reset({ ...empty, ...data }))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew, name]);

  const dirty = form.formState.isDirty && !saved;
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (confirm("You have unsaved changes. Leave anyway?")) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  const onSubmit = form.handleSubmit(async (values) => {
    setError(null);
    try {
      const body = toBody(values);
      if (isNew) await resources.create(name, body);
      else await resources.update(name, id, body);
      setSaved(true);
      // let the blocker see `saved` before navigating
      setTimeout(() => navigate(`/${name}`), 0);
    } catch (e) {
      setError(errorMessage(e));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  if (loading) return <p className="text-muted">Loading…</p>;

  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} noValidate>
        <PageHeader title={title(isNew)}>
          <Link to={`/${name}`} className="btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving…" : "Save"}
          </button>
        </PageHeader>
        <ErrorBox message={error} />
        <div className="space-y-5">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <Link to={`/${name}`} className="btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn-primary" disabled={form.formState.isSubmitting}>
            Save
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card space-y-4 p-4 sm:p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}
