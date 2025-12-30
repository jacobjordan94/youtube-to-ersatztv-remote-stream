export interface ConvertVideoRequest {
  url: string;
  includeDuration: boolean;
  scriptOptions: string;
}

export interface VideoMetadata {
  title: string;
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
  includeDuration: boolean;
  scriptOptions: string;
}

export interface ConvertPlaylistResponse {
  videos: PlaylistVideo[];
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}
