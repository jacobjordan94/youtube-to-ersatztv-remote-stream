export type DurationMode = 'none' | 'custom' | 'api' | 'api-padded';

export interface ConvertVideoRequest {
  url: string;
  durationMode: DurationMode;
  scriptOptions: string;
  customDuration?: string;
  paddingInterval?: number;
}

export interface ThumbnailInfo {
  url: string;
  width: number;
  height: number;
}

export interface Thumbnails {
  default?: ThumbnailInfo;
  medium?: ThumbnailInfo;
  high?: ThumbnailInfo;
  standard?: ThumbnailInfo;
  maxres?: ThumbnailInfo;
}

export interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  isLive: boolean;
  videoId: string;
  publishedAt?: string;
  thumbnails?: Thumbnails;
}

export interface ConvertVideoResponse {
  yaml: string;
  metadata: VideoMetadata;
}

export interface PlaylistVideo {
  yaml: string;
  filename: string;
  metadata: VideoMetadata;
}

export interface ConvertPlaylistRequest {
  url: string;
  durationMode: DurationMode;
  scriptOptions: string;
  customDuration?: string;
  paddingInterval?: number;
}

export interface ConvertPlaylistResponse {
  videos: PlaylistVideo[];
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
