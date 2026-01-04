import { describe, it, expect } from 'vitest';
import { generateYaml } from '../../src/services/yaml';
import type { VideoMetadata } from '@youtube-to-ersatztv/shared';

describe('generateYaml', () => {
  const mockVodMetadata: VideoMetadata = {
    title: 'Test Video',
    description: '',
    duration: '00:03:33',
    isLive: false,
    videoId: 'dQw4w9WgXcQ',
  };

  const mockLiveMetadata: VideoMetadata = {
    title: 'Live Stream',
    description: '',
    duration: '02:00:00',
    isLive: true,
    videoId: 'liveStream123',
  };

  const baseOptions = {
    scriptTemplate: 'yt-dlp {VIDEO_URL} --hls-use-mpegts -o -',
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  };

  describe('duration mode: none', () => {
    it('should omit duration for VOD videos', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'none',
      });

      expect(yaml).toContain('script: "yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -"');
      expect(yaml).toContain('is_live: false');
      expect(yaml).not.toContain('duration:');
    });

    it('should include duration for live streams even in none mode', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseOptions,
        durationMode: 'none',
      });

      expect(yaml).toContain('is_live: true');
      expect(yaml).toContain('duration: 02:00:00');
    });
  });

  describe('duration mode: custom', () => {
    it('should use custom duration for VOD', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'custom',
        customDuration: '01:30:00',
      });

      expect(yaml).toContain('duration: 01:30:00');
      expect(yaml).toContain('is_live: false');
    });

    it('should use custom duration for live streams', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseOptions,
        durationMode: 'custom',
        customDuration: '03:00:00',
      });

      expect(yaml).toContain('duration: 03:00:00');
      expect(yaml).toContain('is_live: true');
    });
  });

  describe('duration mode: api', () => {
    it('should use API duration for VOD', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'api',
      });

      expect(yaml).toContain('duration: 00:03:33');
      expect(yaml).toContain('is_live: false');
    });

    it('should use API duration for live streams', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseOptions,
        durationMode: 'api',
      });

      expect(yaml).toContain('duration: 02:00:00');
      expect(yaml).toContain('is_live: true');
    });
  });

  describe('duration mode: api-padded', () => {
    it('should pad duration to 5 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'api-padded',
        paddingInterval: 5,
      });

      expect(yaml).toContain('duration: 00:05:00');
      expect(yaml).not.toContain('duration: 00:03:33');
    });

    it('should pad duration to 10 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'api-padded',
        paddingInterval: 10,
      });

      expect(yaml).toContain('duration: 00:10:00');
    });

    it('should pad duration to 15 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'api-padded',
        paddingInterval: 15,
      });

      expect(yaml).toContain('duration: 00:15:00');
    });

    it('should pad duration to 30 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'api-padded',
        paddingInterval: 30,
      });

      expect(yaml).toContain('duration: 00:30:00');
    });

    it('should pad live stream duration', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseOptions,
        durationMode: 'api-padded',
        paddingInterval: 30,
      });

      expect(yaml).toContain('duration: 02:00:00'); // Already on 30min boundary
    });
  });

  describe('script template interpolation', () => {
    it('should replace {VIDEO_URL} placeholder', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'none',
      });

      expect(yaml).toContain('https://youtube.com/watch?v=dQw4w9WgXcQ');
      expect(yaml).not.toContain('{VIDEO_URL}');
    });

    it('should handle different script templates', () => {
      const yaml = generateYaml(mockVodMetadata, {
        scriptTemplate: 'yt-dlp {VIDEO_URL} --no-warnings -o -',
        videoUrl: 'https://youtube.com/watch?v=testId',
        durationMode: 'none',
      });

      expect(yaml).toContain('yt-dlp https://youtube.com/watch?v=testId --no-warnings -o -');
    });
  });

  describe('is_live flag', () => {
    it('should set is_live to false for VOD', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'none',
      });

      expect(yaml).toContain('is_live: false');
    });

    it('should set is_live to true for live streams', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseOptions,
        durationMode: 'none',
      });

      expect(yaml).toContain('is_live: true');
    });
  });

  describe('YAML format validation', () => {
    it('should generate valid YAML structure', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'api',
      });

      const lines = yaml.split('\n');
      expect(lines).toHaveLength(3);
      expect(lines[0]).toMatch(/^script: "/);
      expect(lines[1]).toBe('is_live: false');
      expect(lines[2]).toBe('duration: 00:03:33');
    });

    it('should quote script value', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'none',
      });

      expect(yaml).toMatch(/^script: ".*"$/m);
    });

    it('should not quote boolean values', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'none',
      });

      expect(yaml).toContain('is_live: false');
      expect(yaml).not.toContain('is_live: "false"');
    });

    it('should not quote duration values', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        durationMode: 'api',
      });

      expect(yaml).toContain('duration: 00:03:33');
      expect(yaml).not.toContain('duration: "00:03:33"');
    });
  });

  describe('edge cases', () => {
    it('should handle very short duration', () => {
      const shortVideo: VideoMetadata = {
        ...mockVodMetadata,
        duration: '00:00:15',
      };

      const yaml = generateYaml(shortVideo, {
        ...baseOptions,
        durationMode: 'api',
      });

      expect(yaml).toContain('duration: 00:00:15');
    });

    it('should handle very long duration', () => {
      const longVideo: VideoMetadata = {
        ...mockVodMetadata,
        duration: '10:30:45',
      };

      const yaml = generateYaml(longVideo, {
        ...baseOptions,
        durationMode: 'api',
      });

      expect(yaml).toContain('duration: 10:30:45');
    });

    it('should handle special characters in URL', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseOptions,
        videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
        durationMode: 'none',
      });

      expect(yaml).toContain('https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s');
    });
  });

  describe('real-world scenarios', () => {
    it('should generate YAML for typical VOD with no duration', () => {
      const yaml = generateYaml(mockVodMetadata, {
        scriptTemplate: 'yt-dlp {VIDEO_URL} --hls-use-mpegts -o -',
        videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        durationMode: 'none',
      });

      expect(yaml).toBe(
        'script: "yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -"\n' +
        'is_live: false'
      );
    });

    it('should generate YAML for VOD with padded duration (ErsatzTV blocks)', () => {
      const yaml = generateYaml(mockVodMetadata, {
        scriptTemplate: 'yt-dlp {VIDEO_URL} --hls-use-mpegts -o -',
        videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        durationMode: 'api-padded',
        paddingInterval: 15,
      });

      expect(yaml).toContain('duration: 00:15:00');
    });

    it('should generate YAML for 2-hour live stream', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        scriptTemplate: 'yt-dlp {VIDEO_URL} --hls-use-mpegts -o -',
        videoUrl: 'https://youtube.com/watch?v=liveStream123',
        durationMode: 'custom',
        customDuration: '02:00:00',
      });

      expect(yaml).toContain('is_live: true');
      expect(yaml).toContain('duration: 02:00:00');
    });
  });
});
