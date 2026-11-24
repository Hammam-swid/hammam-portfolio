import { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { errorMessage, mediaUrl, uploadFiles } from "../lib/api";
import type { Project, ProjectMedia } from "../types";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm";

/**
 * Edits `media` (gallery) and `cover` of a project form. Files are uploaded to the
 * API immediately; the API deletes files that are no longer referenced when the
 * project is saved, so removing an item here is safe until you save.
 */
export default function MediaManager() {
  const { control, register, setValue } = useFormContext<Project>();
  const { fields, append, remove, move } = useFieldArray({ control, name: "media" });
  const media = useWatch({ control, name: "media" }) as ProjectMedia[] | undefined;
  const cover = useWatch({ control, name: "cover" });
  const input = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const images = (media ?? []).filter((m) => m.type === "image");

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setError(null);
    setProgress(0);
    try {
      const uploaded = await uploadFiles([...list], "projects", setProgress);
      uploaded.forEach((u) => append({ type: u.type, src: u.src, caption: { en: "", ar: "" } }));
      const firstImage = uploaded.find((u) => u.type === "image");
      if (!cover && firstImage) setValue("cover", firstImage.src, { shouldDirty: true });
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setProgress(null);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div
        className="grid cursor-pointer place-items-center rounded-xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted transition hover:border-accent hover:text-ink"
        onClick={() => input.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void onFiles(e.dataTransfer.files);
        }}
      >
        {progress === null ? (
          <span>
            Drop images / videos here or <span className="text-accent">browse</span>
            <br />
            <span className="text-xs">JPG, PNG, WebP, GIF, AVIF, MP4, WebM</span>
          </span>
        ) : (
          <span>Uploading… {progress}%</span>
        )}
        <input
          ref={input}
          type="file"
          multiple
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => void onFiles(e.target.files)}
        />
      </div>
      {error && <p className="text-sm whitespace-pre-line text-danger">{error}</p>}

      {fields.length === 0 && <p className="text-sm text-muted">No media yet — the site shows a placeholder.</p>}

      <ul className="space-y-3">
        {fields.map((f, i) => {
          const m = media?.[i];
          if (!m) return null;
          const isCover = m.type === "image" && m.src === cover;
          return (
            <li key={f.id} className="card flex flex-col gap-3 p-3 sm:flex-row">
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-lg bg-black sm:w-48">
                {m.type === "video" ? (
                  <video src={mediaUrl(m.src)} poster={mediaUrl(m.poster)} muted className="h-full w-full object-cover" />
                ) : (
                  <img src={mediaUrl(m.src)} alt="" className="h-full w-full object-cover" />
                )}
                <span className="absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] uppercase">
                  {m.type}
                  {i === 0 && " · first"}
                </span>
                {isCover && (
                  <span className="absolute top-1.5 right-1.5 rounded bg-accent px-1.5 py-0.5 text-[10px]">cover</span>
                )}
              </div>

              <div className="grid flex-1 gap-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input className="input" placeholder="Caption (English)" {...register(`media.${i}.caption.en`)} />
                  <input
                    className="input"
                    dir="rtl"
                    placeholder="الوصف (العربية)"
                    {...register(`media.${i}.caption.ar`)}
                  />
                </div>
                {m.type === "video" && (
                  <select className="input" {...register(`media.${i}.poster`)}>
                    <option value="">No poster image</option>
                    {images.map((img) => (
                      <option key={img.src} value={img.src}>
                        Poster: {img.src.split("/").pop()}
                      </option>
                    ))}
                  </select>
                )}
                <p className="truncate text-xs text-muted" title={m.src}>
                  {m.src}
                </p>
              </div>

              <div className="flex shrink-0 gap-1.5 sm:flex-col">
                <button type="button" className="btn-icon" title="Move up" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  ↑
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Move down"
                  disabled={i === fields.length - 1}
                  onClick={() => move(i, i + 1)}
                >
                  ↓
                </button>
                {m.type === "image" && !isCover && (
                  <button
                    type="button"
                    className="btn-icon"
                    title="Use as cover"
                    onClick={() => setValue("cover", m.src, { shouldDirty: true })}
                  >
                    ★
                  </button>
                )}
                <button
                  type="button"
                  className="btn-icon hover:text-danger"
                  title="Remove"
                  onClick={() => {
                    if (isCover) setValue("cover", images.find((x) => x.src !== m.src)?.src ?? "", { shouldDirty: true });
                    remove(i);
                  }}
                >
                  ✕
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">
        The first item is what the project card shows. ★ picks the cover image.
      </p>
    </div>
  );
}
