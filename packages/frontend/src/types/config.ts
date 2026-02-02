export type FilenameFormat =
  | 'original' // My Video Title.yml
  | 'compact' // my-video-title.yml (current default)
  | 'kebab' // My-Video-Title.yml
  | 'snake' // my_video_title.yml
  | 'sequential-prefix' // 001-my-video-title.yml (playlist only)
  | 'sequential-suffix'; // my-video-title-001.yml (playlist only)

export type ThumbnailResolution =
  | 'highest'
  | 'lowest'
  | 'default'
  | 'medium'
  | 'high'
  | 'standard'
  | 'maxres';

export interface ConfigSettings {
  durationMode: 'none' | 'custom' | 'api' | 'api-padded';
  customDuration: string;
  paddingInterval: number;
  scriptOptions: string;
  livestreamDuration: string;
  customLivestreamDuration: string;
  includeTitle: boolean;
  includePlot: boolean;
  plotFormat: 'string' | 'folded' | 'literal';
  includeYear: boolean;
  includeContentRating: boolean;
  contentRating: string;
  filenameFormat: FilenameFormat;
  includeThumbnail: boolean;
  thumbnailResolution: ThumbnailResolution;
}

export type SettingsMode = 'global' | 'per-file';
export type AppScreen = 'input' | 'config';
