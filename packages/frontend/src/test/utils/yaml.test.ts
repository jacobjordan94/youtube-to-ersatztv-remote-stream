import { describe, it, expect } from 'vitest';
import { escapeYamlString, formatDescription, generateYaml } from '../../utils/yaml';
import type { YamlMetadata, YamlConfigSettings } from '../../utils/yaml';

describe('escapeYamlString', () => {
  it('should escape backslashes', () => {
    expect(escapeYamlString('path\\to\\file')).toBe('path\\\\to\\\\file');
  });

  it('should escape double quotes', () => {
    expect(escapeYamlString('He said "Hello"')).toBe('He said \\"Hello\\"');
  });

  it('should escape newlines', () => {
    expect(escapeYamlString('Line 1\nLine 2')).toBe('Line 1\\nLine 2');
  });

  it('should escape carriage returns', () => {
    expect(escapeYamlString('Line 1\rLine 2')).toBe('Line 1\\rLine 2');
  });

  it('should escape tabs', () => {
    expect(escapeYamlString('Col1\tCol2')).toBe('Col1\\tCol2');
  });

  it('should handle multiple special characters', () => {
    expect(escapeYamlString('path\\file\n"quoted"\t')).toBe('path\\\\file\\n\\"quoted\\"\\t');
  });

  it('should handle empty string', () => {
    expect(escapeYamlString('')).toBe('');
  });

  it('should handle string with no special characters', () => {
    expect(escapeYamlString('Regular text')).toBe('Regular text');
  });
});

describe('formatDescription', () => {
  describe('string format', () => {
    it('should format as quoted string', () => {
      const result = formatDescription('Simple description', 'string');
      expect(result).toBe('description: "Simple description"');
    });

    it('should escape special characters in quoted string', () => {
      const result = formatDescription('Description with "quotes"', 'string');
      expect(result).toBe('description: "Description with \\"quotes\\""');
    });

    it('should escape newlines in quoted string', () => {
      const result = formatDescription('Line 1\nLine 2', 'string');
      expect(result).toBe('description: "Line 1\\nLine 2"');
    });
  });

  describe('folded format', () => {
    it('should format as folded block scalar', () => {
      const result = formatDescription('Simple description', 'folded');
      expect(result).toBe('description: >\n  Simple description');
    });

    it('should preserve line structure with indentation', () => {
      const result = formatDescription('Line 1\nLine 2\nLine 3', 'folded');
      expect(result).toBe('description: >\n  Line 1\n  Line 2\n  Line 3');
    });

    it('should handle multi-paragraph text', () => {
      const result = formatDescription('Paragraph 1\n\nParagraph 2', 'folded');
      expect(result).toBe('description: >\n  Paragraph 1\n  \n  Paragraph 2');
    });
  });

  describe('literal format', () => {
    it('should format as literal block scalar', () => {
      const result = formatDescription('Simple description', 'literal');
      expect(result).toBe('description: |\n  Simple description');
    });

    it('should preserve exact formatting', () => {
      const result = formatDescription('Line 1\nLine 2\nLine 3', 'literal');
      expect(result).toBe('description: |\n  Line 1\n  Line 2\n  Line 3');
    });

    it('should preserve blank lines', () => {
      const result = formatDescription('Paragraph 1\n\nParagraph 2', 'literal');
      expect(result).toBe('description: |\n  Paragraph 1\n  \n  Paragraph 2');
    });

    it('should preserve trailing whitespace structure', () => {
      const result = formatDescription('Text with\n  indentation', 'literal');
      expect(result).toBe('description: |\n  Text with\n    indentation');
    });
  });
});

describe('generateYaml', () => {
  const mockVodMetadata: YamlMetadata = {
    title: 'Test Video',
    description: 'Test description',
    duration: '00:03:33',
    isLive: false,
    videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
  };

  const mockLiveMetadata: YamlMetadata = {
    title: 'Live Stream',
    description: 'Live stream description',
    duration: '02:00:00',
    isLive: true,
    videoUrl: 'https://youtube.com/watch?v=liveStream123',
  };

  const baseSettings: YamlConfigSettings = {
    durationMode: 'none',
    customDuration: '00:00:00',
    paddingInterval: 5,
    scriptOptions: '--hls-use-mpegts',
    livestreamDuration: '02:00:00',
    customLivestreamDuration: '03:00:00',
    includeTitle: false,
    includeDescription: false,
    descriptionFormat: 'string',
  };

  describe('basic VOD generation', () => {
    it('should generate basic YAML for VOD with no duration', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'none',
      });

      expect(yaml).toContain('script: "yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -"');
      expect(yaml).toContain('is_live: false');
      expect(yaml).not.toContain('duration:');
    });

    it('should generate YAML with API duration', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'api',
      });

      expect(yaml).toContain('duration: 00:03:33');
    });

    it('should generate YAML with custom duration', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'custom',
        customDuration: '01:30:00',
      });

      expect(yaml).toContain('duration: 01:30:00');
    });
  });

  describe('padded duration calculation', () => {
    it('should pad to 5 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'api-padded',
        paddingInterval: 5,
      });

      expect(yaml).toContain('duration: 00:05:00');
    });

    it('should pad to 10 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'api-padded',
        paddingInterval: 10,
      });

      expect(yaml).toContain('duration: 00:10:00');
    });

    it('should pad to 15 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'api-padded',
        paddingInterval: 15,
      });

      expect(yaml).toContain('duration: 00:15:00');
    });

    it('should pad to 30 minute interval', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'api-padded',
        paddingInterval: 30,
      });

      expect(yaml).toContain('duration: 00:30:00');
    });
  });

  describe('livestream generation', () => {
    it('should use livestream duration setting', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseSettings,
        livestreamDuration: '02:00:00',
      });

      expect(yaml).toContain('is_live: true');
      expect(yaml).toContain('duration: 02:00:00');
    });

    it('should use custom livestream duration when set', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseSettings,
        livestreamDuration: 'custom',
        customLivestreamDuration: '03:00:00',
      });

      expect(yaml).toContain('duration: 03:00:00');
    });
  });

  describe('optional fields', () => {
    it('should include title when enabled', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        includeTitle: true,
      });

      expect(yaml).toContain('title: "Test Video"');
    });

    it('should exclude title when disabled', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        includeTitle: false,
      });

      expect(yaml).not.toContain('title:');
    });

    it('should escape quotes in title', () => {
      const metadata = { ...mockVodMetadata, title: 'Video with "quotes"' };
      const yaml = generateYaml(metadata, {
        ...baseSettings,
        includeTitle: true,
      });

      expect(yaml).toContain('title: "Video with \\"quotes\\""');
    });

    it('should include description as string when enabled', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        includeDescription: true,
        descriptionFormat: 'string',
      });

      expect(yaml).toContain('description: "Test description"');
    });

    it('should include description as folded when enabled', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        includeDescription: true,
        descriptionFormat: 'folded',
      });

      expect(yaml).toContain('description: >');
      expect(yaml).toContain('  Test description');
    });

    it('should include description as literal when enabled', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        includeDescription: true,
        descriptionFormat: 'literal',
      });

      expect(yaml).toContain('description: |');
      expect(yaml).toContain('  Test description');
    });

    it('should exclude description when disabled', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        includeDescription: false,
      });

      expect(yaml).not.toContain('description:');
    });
  });

  describe('script template', () => {
    it('should include script options in template', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        scriptOptions: '--no-warnings --hls-use-mpegts',
      });

      expect(yaml).toContain('yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --no-warnings --hls-use-mpegts -o -');
    });

    it('should always include -o - flag', () => {
      const yaml = generateYaml(mockVodMetadata, baseSettings);

      expect(yaml).toContain('-o -');
    });
  });

  describe('real-world scenarios', () => {
    it('should generate complete YAML with all optional fields', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'api',
        includeTitle: true,
        includeDescription: true,
        descriptionFormat: 'literal',
      });

      expect(yaml).toContain('script:');
      expect(yaml).toContain('is_live: false');
      expect(yaml).toContain('duration: 00:03:33');
      expect(yaml).toContain('title: "Test Video"');
      expect(yaml).toContain('description: |');
    });

    it('should generate minimal YAML for VOD', () => {
      const yaml = generateYaml(mockVodMetadata, {
        ...baseSettings,
        durationMode: 'none',
        includeTitle: false,
        includeDescription: false,
      });

      const lines = yaml.split('\n');
      expect(lines).toHaveLength(2);
      expect(lines[0]).toContain('script:');
      expect(lines[1]).toBe('is_live: false');
    });

    it('should generate YAML for 2-hour livestream block', () => {
      const yaml = generateYaml(mockLiveMetadata, {
        ...baseSettings,
        livestreamDuration: '02:00:00',
        includeTitle: true,
      });

      expect(yaml).toContain('is_live: true');
      expect(yaml).toContain('duration: 02:00:00');
      expect(yaml).toContain('title: "Live Stream"');
    });
  });

  describe('edge cases', () => {
    it('should handle empty description', () => {
      const metadata = { ...mockVodMetadata, description: '' };
      const yaml = generateYaml(metadata, {
        ...baseSettings,
        includeDescription: true,
      });

      expect(yaml).toContain('description: ""');
    });

    it('should handle very long title', () => {
      const metadata = { ...mockVodMetadata, title: 'A'.repeat(500) };
      const yaml = generateYaml(metadata, {
        ...baseSettings,
        includeTitle: true,
      });

      expect(yaml).toContain('title:');
    });

    it('should handle URL with query parameters', () => {
      const metadata = {
        ...mockVodMetadata,
        videoUrl: 'https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s',
      };
      const yaml = generateYaml(metadata, baseSettings);

      expect(yaml).toContain('https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s');
    });
  });
});
