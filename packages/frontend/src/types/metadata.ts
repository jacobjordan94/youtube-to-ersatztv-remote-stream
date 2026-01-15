import type { Thumbnails } from '@youtube-to-ersatztv/shared';

export interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  isLive: boolean;
  videoUrl: string;
  publishedAt?: string;
  thumbnails?: Thumbnails;
}
