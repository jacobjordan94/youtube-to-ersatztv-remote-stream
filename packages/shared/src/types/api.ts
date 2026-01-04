export type DurationMode = 'none' | 'custom' | 'api' | 'api-padded';

export interface ConvertVideoRequest {
  url: string;
  durationMode: DurationMode;
  scriptOptions: string;
  customDuration?: string;
  paddingInterval?: number;
}

export interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  isLive: boolean;
  videoId: string;
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
