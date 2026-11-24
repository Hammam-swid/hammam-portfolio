import { useEffect, useRef, useState } from "react";
import type { ProjectMedia } from "../../types";
import Icon from "../fx/Icon";
import { useLang } from "../../hooks/useLang";
import { mediaUrl } from "../../lib/media";

/**
 * Shows a screenshot or video. If the file isn't there yet, renders a branded
 * mock "app window" so cards still look intentional until real media is added.
 */
export default function MediaFrame({
  media,
  title,
  seed = 0,
  mode = "card",
  active = false,
  className = "",
  onRatio,
}: {
  /** reports width / height once the image or video is known */
  onRatio?: (ratio: number) => void;
  media?: ProjectMedia;
  title: string;
  seed?: number;
  /** card: muted loop preview on hover; full: controls + autoplay */
  mode?: "card" | "full" | "thumb";
  /** for card videos: play while true */
  active?: boolean;
  className?: string;
}) {
  const { l } = useLang();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !!media && failedSrc === media.src;
  const setFailed = () => setFailedSrc(media?.src ?? null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v || mode !== "card") return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active, mode]);

  if (!media || failed)
    return (
      <Placeholder
        title={title}
        seed={seed}
        video={media?.type === "video"}
        className={className}
        compact={mode === "thumb"}
      />
    );

  if (media.type === "video") {
    if (mode === "thumb" && media.poster) {
      return (
        <Img
          loading="lazy"
          src={mediaUrl(media.poster)}
          alt=""
          className={className}
          onError={() => setFailed()}
        />
      );
    }
    return (
      <video
        ref={videoRef}
        key={media.src}
        src={mediaUrl(media.src)}
        poster={mediaUrl(media.poster)}
        className={`h-full w-full bg-black ${mode === "full" ? "object-contain" : "object-cover"} ${className}`}
        muted={mode !== "full"}
        loop={mode !== "full"}
        playsInline
        controls={mode === "full"}
        autoPlay={mode === "full"}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (v.videoWidth && v.videoHeight)
            onRatio?.(v.videoWidth / v.videoHeight);
        }}
        onError={() => setFailed()}
      />
    );
  }

  const alt = media.caption ? l(media.caption) : title;

  if (mode === "full") {
    // Whole image, never cropped; a blurred copy fills the letterbox so
    // portrait (phone) screenshots don't float in an empty black box.
    return (
      <div
        className={`relative h-full w-full overflow-hidden bg-[#05060f] ${className}`}
      >
        <img
          loading="lazy"
          src={mediaUrl(media.src)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-2xl"
        />
        <img
          loading="lazy"
          src={mediaUrl(media.src)}
          alt={alt}
          decoding="async"
          className="relative h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          onLoad={(e) => {
            const i = e.currentTarget;
            if (i.naturalWidth && i.naturalHeight)
              onRatio?.(i.naturalWidth / i.naturalHeight);
          }}
          onError={() => setFailed()}
        />
      </div>
    );
  }

  // Cards and thumbnails crop; anchor to the top so app headers stay in view
  return (
    <Img
      loading="lazy"
      src={mediaUrl(media.src)}
      alt={alt}
      className={`object-cover object-top ${className}`}
      onError={() => setFailed()}
    />
  );
}

function Img({
  className = "",
  ...rest
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      loading="lazy"
      decoding="async"
      className={`h-full w-full ${className}`}
      {...rest}
    />
  );
}

const HUES = [
  "linear-gradient(135deg,#222a60 0%,#24487d 55%,#2b87b8 100%)",
  "linear-gradient(135deg,#131735 0%,#23356b 50%,#266396 100%)",
  "linear-gradient(135deg,#1a214b 0%,#206488 60%,#4e9bc4 100%)",
];

function Placeholder({
  title,
  seed,
  video,
  compact,
  className = "",
}: {
  title: string;
  seed: number;
  video?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const layout = seed % 3;
  const bar = "rounded bg-white/15";
  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ background: HUES[seed % HUES.length] }}
      role="img"
      aria-label={title}
    >
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:28px_28px]" />
      {!compact && (
        <div
          dir="ltr"
          className="absolute inset-x-[9%] bottom-0 top-[16%] overflow-hidden rounded-t-xl border border-white/15 bg-[#0d1024]/70 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="h-2 w-2 rounded-full bg-white/30" />
            <span className="ms-3 h-2 w-1/3 rounded bg-white/10" />
          </div>
          <div className="flex h-full gap-3 p-3">
            {layout !== 2 && (
              <div className="flex w-1/5 flex-col gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className={`h-2 ${bar} ${i === 1 ? "bg-[#71aecf]/70" : ""}`}
                  />
                ))}
              </div>
            )}
            <div className="flex flex-1 flex-col gap-3">
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-8 rounded-md bg-white/10" />
                ))}
              </div>
              {layout === 1 ? (
                <div className="flex h-16 items-end gap-1.5">
                  {[40, 70, 55, 85, 60, 95, 75].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-t bg-[#4e9bc4]/60"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-2.5 ${bar}`}
                      style={{ width: `${90 - i * 12}%` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {video && !compact && (
        <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#222a60] shadow-xl">
          <Icon name="play" size={22} />
        </span>
      )}
    </div>
  );
}
