import type { Media } from "payload-types";

const PAYLOAD_PUBLIC =
  process.env.NEXT_PUBLIC_PAYLOAD_URL || process.env.PAYLOAD_URL || "http://localhost:3000";

export type MediaAsset = {
  url: string;
  rotation: 0 | 90 | 180 | 270;
};

export const EMPTY_MEDIA_ASSET: MediaAsset = {
  url: "",
  rotation: 0,
};

function normalizeRotation(value: unknown): 0 | 90 | 180 | 270 {
  const n = Number(value);
  if (n === 90 || n === 180 || n === 270) return n;
  return 0;
}

export function getMediaAsset(media: unknown): MediaAsset {
  if (!media || typeof media !== "object") return EMPTY_MEDIA_ASSET;

  const m = media as Media & {
    rotation?: string | number | null;
    sizes?: { card?: { url?: string }; tablet?: { url?: string } };
  };

  const rawUrl = m.url || m.sizes?.card?.url || m.sizes?.tablet?.url || "";
  if (!rawUrl) {
    return {
      url: "",
      rotation: normalizeRotation(m.rotation),
    };
  }

  if (rawUrl.startsWith("http")) {
    return {
      url: rawUrl,
      rotation: normalizeRotation(m.rotation),
    };
  }

  if (rawUrl.startsWith("/")) {
    return {
      url: rawUrl,
      rotation: normalizeRotation(m.rotation),
    };
  }

  const base = PAYLOAD_PUBLIC.replace(/\/$/, "");
  return {
    url: `${base}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`,
    rotation: normalizeRotation(m.rotation),
  };
}
