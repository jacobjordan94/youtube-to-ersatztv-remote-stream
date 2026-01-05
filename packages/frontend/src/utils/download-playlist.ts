import JSZip from 'jszip';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import { downloadFile } from './download';

/**
 * Downloads all playlist videos as a ZIP archive
 * @param videos - Array of playlist videos with their YAML content
 */
export async function downloadAsZip(videos: PlaylistVideo[]): Promise<void> {
  const zip = new JSZip();

  videos.forEach((video) => {
    // Use pre-formatted filename from video object
    zip.file(video.filename, video.yaml);
  });

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
 */
export async function downloadAsQueue(videos: PlaylistVideo[]): Promise<void> {
  for (const video of videos) {
    // Use pre-formatted filename from video object
    downloadFile(video.yaml, video.filename);

    // Add delay between downloads to avoid browser blocking
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
}

/**
 * Downloads a single video from a playlist
 * @param video - The playlist video to download
 */
export function downloadCurrent(video: PlaylistVideo): void {
  // Use pre-formatted filename from video object
  downloadFile(video.yaml, video.filename);
}
