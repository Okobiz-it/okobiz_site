/**
 * Robust YouTube video utilities for parsing, embed generation, and thumbnail fetching.
 */

export function getYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([\w-]{11})/;
  const match = trimmed.match(regExp);
  if (match) return match[1];
  if (/^[\w-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

export function isYouTubeUrl(url?: string | null): boolean {
  return !!getYouTubeId(url);
}

export function getYouTubeEmbedUrl(url?: string | null): string | null {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&playsinline=1`;
}

export function getYouTubeThumbnailUrl(url?: string | null): string | null {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
