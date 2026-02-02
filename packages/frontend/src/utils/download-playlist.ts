import JSZip from 'jszip';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import type { ThumbnailResolution } from '@/types/config';
import {
  downloadFile,
  downloadBlob,
  fetchThumbnail,
  getThumbnailExtension,
  getThumbnailUrl,
} from './download';

interface ThumbnailOptions {
  includeThumbnail: boolean;
  thumbnailResolution: ThumbnailResolution;
}

/**
 * Downloads all playlist videos as a ZIP archive
 * @param videos - Array of playlist videos with their YAML content
 * @param options - Optional thumbnail settings
 */
export async function downloadAsZip(
  videos: PlaylistVideo[],
  options?: ThumbnailOptions
): Promise<void> {
  const zip = new JSZip();

  for (const video of videos) {
    // Add YAML file
    zip.file(video.filename, video.yaml);

    // Add thumbnail if enabled
    if (options?.includeThumbnail) {
      const thumbnailUrl = getThumbnailUrl(video.metadata.thumbnails, options.thumbnailResolution);
      if (thumbnailUrl) {
        try {
          const blob = await fetchThumbnail(thumbnailUrl);
          const ext = getThumbnailExtension(thumbnailUrl);
          const thumbnailFilename = video.filename.replace(/\.yml$/, `.${ext}`);
          zip.file(thumbnailFilename, blob);
        } catch {
          // Skip thumbnail if fetch fails
          console.warn(`Failed to fetch thumbnail for ${video.metadata.title}`);
        }
      }
    }
  }

  // Generate ZIP and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'playlist-yamls.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all playlist videos one by one with a delay between each
 * @param videos - Array of playlist videos with their YAML content
 * @param options - Optional thumbnail settings
 */
export async function downloadAsQueue(
  videos: PlaylistVideo[],
  options?: ThumbnailOptions
): Promise<void> {
  for (const video of videos) {
    // Download YAML file
    downloadFile(video.yaml, video.filename);

    // Download thumbnail if enabled
    if (options?.includeThumbnail) {
      const thumbnailUrl = getThumbnailUrl(video.metadata.thumbnails, options.thumbnailResolution);
      if (thumbnailUrl) {
        try {
          const blob = await fetchThumbnail(thumbnailUrl);
          const ext = getThumbnailExtension(thumbnailUrl);
          const thumbnailFilename = video.filename.replace(/\.yml$/, `.${ext}`);
          downloadBlob(blob, thumbnailFilename);
        } catch {
          console.warn(`Failed to fetch thumbnail for ${video.metadata.title}`);
        }
      }
    }

    // Add delay between downloads to avoid browser blocking
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

/**
 * Downloads a single video from a playlist (YAML only)
 * @param video - The playlist video to download
 */
export function downloadCurrent(video: PlaylistVideo): void {
  downloadFile(video.yaml, video.filename);
}

/**
 * Downloads a single video and its thumbnail as queue
 * @param video - The playlist video to download
 * @param options - Thumbnail settings
 */
export async function downloadCurrentWithThumbnail(
  video: PlaylistVideo,
  options: ThumbnailOptions
): Promise<void> {
  // Download YAML file
  downloadFile(video.yaml, video.filename);

  // Download thumbnail if enabled
  if (options.includeThumbnail) {
    const thumbnailUrl = getThumbnailUrl(video.metadata.thumbnails, options.thumbnailResolution);
    if (thumbnailUrl) {
      try {
        const blob = await fetchThumbnail(thumbnailUrl);
        const ext = getThumbnailExtension(thumbnailUrl);
        const thumbnailFilename = video.filename.replace(/\.yml$/, `.${ext}`);
        // Small delay to avoid download blocking
        await new Promise((resolve) => setTimeout(resolve, 100));
        downloadBlob(blob, thumbnailFilename);
      } catch {
        console.warn(`Failed to fetch thumbnail for ${video.metadata.title}`);
      }
    }
  }
}

/**
 * Downloads a single video and its thumbnail as a ZIP
 * @param video - The playlist video to download
 * @param options - Thumbnail settings
 */
export async function downloadCurrentAsZip(
  video: PlaylistVideo,
  options: ThumbnailOptions
): Promise<void> {
  const zip = new JSZip();

  // Add YAML file
  zip.file(video.filename, video.yaml);

  // Add thumbnail if enabled
  if (options.includeThumbnail) {
    const thumbnailUrl = getThumbnailUrl(video.metadata.thumbnails, options.thumbnailResolution);
    if (thumbnailUrl) {
      try {
        const blob = await fetchThumbnail(thumbnailUrl);
        const ext = getThumbnailExtension(thumbnailUrl);
        const thumbnailFilename = video.filename.replace(/\.yml$/, `.${ext}`);
        zip.file(thumbnailFilename, blob);
      } catch {
        console.warn(`Failed to fetch thumbnail for ${video.metadata.title}`);
      }
    }
  }

  // Generate ZIP and trigger download
  const zipFilename = video.filename.replace(/\.yml$/, '.zip');
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = zipFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
