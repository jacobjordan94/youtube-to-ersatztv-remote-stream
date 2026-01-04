import { VideoMetadata, RemoteStreamConfig } from '@youtube-to-ersatztv/shared';
import { padDurationToInterval } from '../utils/formatters';

export function generateYaml(
  metadata: VideoMetadata,
  options: {
    durationMode: 'none' | 'custom' | 'api' | 'api-padded';
    scriptTemplate: string;
    videoUrl: string;
    customDuration?: string;
    paddingInterval?: number;
  }
): string {
  const config: RemoteStreamConfig = {
    script: options.scriptTemplate.replace('{VIDEO_URL}', options.videoUrl),
    is_live: metadata.isLive,
  };

  // Determine which duration to include based on mode
  if (metadata.isLive || options.durationMode !== 'none') {
    switch (options.durationMode) {
      case 'custom':
        config.duration = options.customDuration;
        break;
      case 'api':
        config.duration = metadata.duration;
        break;
      case 'api-padded':
        config.duration = padDurationToInterval(
          metadata.duration,
          options.paddingInterval!
        );
        break;
      case 'none':
        // Only include duration for live streams
        if (metadata.isLive) {
          config.duration = metadata.duration;
        }
        break;
    }
  }

  const lines: string[] = [];
  lines.push(`script: "${config.script}"`);
  lines.push(`is_live: ${config.is_live}`);

  if (config.duration) {
    lines.push(`duration: ${config.duration}`);
  }

  return lines.join('\n');
}
