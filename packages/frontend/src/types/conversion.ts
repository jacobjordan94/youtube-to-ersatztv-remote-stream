import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';
import type { VideoMetadata } from './metadata';
import type { ConfigSettings } from './config';

export interface ConversionResult {
  videos: PlaylistVideo[];
  firstVideo: {
    metadata: VideoMetadata;
    title: string;
    yaml: string;
  };
  initialSettings: ConfigSettings;
}
