import { VideoMetadata, RemoteStreamConfig } from '@youtube-to-ersatztv/shared';

export function generateYaml(
  metadata: VideoMetadata,
  options: {
    includeDuration: boolean;
    scriptTemplate: string;
    videoUrl: string;
  }
): string {
  const config: RemoteStreamConfig = {
    script: options.scriptTemplate.replace('{VIDEO_URL}', options.videoUrl),
    is_live: metadata.isLive,
  };

  if (metadata.isLive || options.includeDuration) {
    config.duration = metadata.duration;
  }

  const lines: string[] = [];
  lines.push(`script: "${config.script}"`);
  lines.push(`is_live: ${config.is_live}`);

  if (config.duration) {
    lines.push(`duration: ${config.duration}`);
  }

  return lines.join('\n');
}
