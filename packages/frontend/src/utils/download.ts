import type { Thumbnails } from '@youtube-to-ersatztv/shared';
import type { ThumbnailResolution } from '@/types/config';

export function downloadFile(content: string, filename: string, mimeType: string = 'text/yaml') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function fetchThumbnail(url: string): Promise<Blob> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch thumbnail: ${response.status}`);
  }
  return response.blob();
}

export function getThumbnailExtension(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|webp)(?:\?|$)/i);
  return match ? match[1].toLowerCase() : 'jpg';
}

// Resolution keys in order from highest to lowest quality
const RESOLUTION_ORDER: (keyof Thumbnails)[] = ['maxres', 'standard', 'high', 'medium', 'default'];

export function getThumbnailUrl(
  thumbnails: Thumbnails | undefined,
  resolution: ThumbnailResolution
): string | undefined {
  if (!thumbnails) return undefined;

  // 'lowest' means start from the smallest and work up
  if (resolution === 'lowest') {
    for (let i = RESOLUTION_ORDER.length - 1; i >= 0; i--) {
      const res = RESOLUTION_ORDER[i];
      if (thumbnails[res]?.url) {
        return thumbnails[res]!.url;
      }
    }
    return undefined;
  }

  // 'highest' means start from the best available
  const startIndex = resolution === 'highest' ? 0 : RESOLUTION_ORDER.indexOf(resolution);

  // Try requested resolution first, then fall back to lower resolutions
  for (let i = startIndex; i < RESOLUTION_ORDER.length; i++) {
    const res = RESOLUTION_ORDER[i];
    if (thumbnails[res]?.url) {
      return thumbnails[res]!.url;
    }
  }

  return undefined;
}
