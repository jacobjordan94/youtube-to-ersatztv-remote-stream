import { describe, it, expect } from 'vitest';
import { formatFilename, sanitizeFilename, createPlaylistFilename } from '../../utils/filename';

describe('formatFilename', () => {
  describe('original format', () => {
    it('should preserve spaces and casing', () => {
      expect(formatFilename('My Video Title', 'original')).toBe('My Video Title');
    });

    it('should remove invalid filename characters', () => {
      expect(formatFilename('Video/With\\Invalid:Chars*?.yml', 'original')).toBe('VideoWithInvalidChars.yml');
    });

    it('should preserve punctuation except invalid chars', () => {
      expect(formatFilename('Video! (2024) - Part 1', 'original')).toBe('Video! (2024) - Part 1');
    });

    it('should trim whitespace', () => {
      expect(formatFilename('  Video Title  ', 'original')).toBe('Video Title');
    });

    it('should remove all invalid chars: / \\ : * ? " < > |', () => {
      expect(formatFilename('A/B\\C:D*E?F"G<H>I|J', 'original')).toBe('ABCDEFGHIJ');
    });
  });

  describe('compact format', () => {
    it('should convert to lowercase with hyphens', () => {
      expect(formatFilename('My Video Title', 'compact')).toBe('my-video-title');
    });

    it('should remove special characters', () => {
      expect(formatFilename('My@Video#Title!', 'compact')).toBe('myvideotitle');
    });

    it('should convert multiple spaces to single hyphen', () => {
      expect(formatFilename('My    Video    Title', 'compact')).toBe('my-video-title');
    });

    it('should preserve numbers', () => {
      expect(formatFilename('Video 123 Title 456', 'compact')).toBe('video-123-title-456');
    });

    it('should handle already-hyphenated text', () => {
      expect(formatFilename('already-hyphenated-title', 'compact')).toBe('already-hyphenated-title');
    });
  });

  describe('kebab format', () => {
    it('should preserve casing with hyphens', () => {
      expect(formatFilename('My Video Title', 'kebab')).toBe('My-Video-Title');
    });

    it('should remove invalid chars but preserve punctuation', () => {
      expect(formatFilename('Video! (2024)', 'kebab')).toBe('Video!-(2024)');
    });

    it('should collapse multiple hyphens', () => {
      expect(formatFilename('My---Video---Title', 'kebab')).toBe('My-Video-Title');
    });

    it('should convert spaces to hyphens', () => {
      expect(formatFilename('Video  With  Spaces', 'kebab')).toBe('Video-With-Spaces');
    });
  });

  describe('snake format', () => {
    it('should convert to lowercase with underscores', () => {
      expect(formatFilename('My Video Title', 'snake')).toBe('my_video_title');
    });

    it('should remove special characters', () => {
      expect(formatFilename('My@Video#Title!', 'snake')).toBe('myvideotitle');
    });

    it('should convert multiple spaces to single underscore', () => {
      expect(formatFilename('My    Video    Title', 'snake')).toBe('my_video_title');
    });

    it('should preserve numbers', () => {
      expect(formatFilename('Video 123 Title 456', 'snake')).toBe('video_123_title_456');
    });
  });

  describe('sequential-prefix format', () => {
    it('should add zero-padded prefix', () => {
      expect(formatFilename('My Video', 'sequential-prefix', 0)).toBe('001-my-video');
    });

    it('should handle double-digit index', () => {
      expect(formatFilename('My Video', 'sequential-prefix', 42)).toBe('043-my-video');
    });

    it('should handle triple-digit index', () => {
      expect(formatFilename('My Video', 'sequential-prefix', 999)).toBe('1000-my-video');
    });

    it('should throw error if index not provided', () => {
      expect(() => formatFilename('My Video', 'sequential-prefix')).toThrow('Index required');
    });

    it('should use compact format for base filename', () => {
      expect(formatFilename('My Special! Video@', 'sequential-prefix', 5)).toBe('006-my-special-video');
    });
  });

  describe('sequential-suffix format', () => {
    it('should add zero-padded suffix', () => {
      expect(formatFilename('My Video', 'sequential-suffix', 0)).toBe('my-video-001');
    });

    it('should handle double-digit index', () => {
      expect(formatFilename('My Video', 'sequential-suffix', 42)).toBe('my-video-043');
    });

    it('should handle triple-digit index', () => {
      expect(formatFilename('My Video', 'sequential-suffix', 999)).toBe('my-video-1000');
    });

    it('should throw error if index not provided', () => {
      expect(() => formatFilename('My Video', 'sequential-suffix')).toThrow('Index required');
    });

    it('should use compact format for base filename', () => {
      expect(formatFilename('My Special! Video@', 'sequential-suffix', 5)).toBe('my-special-video-006');
    });
  });

  describe('maxLength truncation', () => {
    const longTitle = 'A'.repeat(300);

    it('should truncate to 200 characters by default', () => {
      const result = formatFilename(longTitle, 'compact');
      expect(result.length).toBe(200);
    });

    it('should respect custom maxLength', () => {
      const result = formatFilename(longTitle, 'compact', undefined, 50);
      expect(result.length).toBe(50);
    });

    it('should truncate after formatting for original format', () => {
      const result = formatFilename(longTitle, 'original', undefined, 50);
      expect(result.length).toBe(50);
    });

    it('should account for sequential prefix in maxLength', () => {
      const longTitle = 'A'.repeat(300);
      const result = formatFilename(longTitle, 'sequential-prefix', 0, 50);
      // Result should be "001-" + truncated title, total 50 chars
      expect(result.length).toBeLessThanOrEqual(50);
      expect(result.startsWith('001-')).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(formatFilename('', 'compact')).toBe('');
    });

    it('should handle string with only invalid chars', () => {
      expect(formatFilename('//\\\\::**??', 'original')).toBe('');
    });

    it('should handle string with only spaces', () => {
      expect(formatFilename('     ', 'compact')).toBe('-');
    });

    it('should handle unicode characters in original format', () => {
      expect(formatFilename('Video 日本語 Title', 'original')).toBe('Video 日本語 Title');
    });

    it('should remove unicode in compact format', () => {
      expect(formatFilename('Video 日本語 Title', 'compact')).toBe('video-title');
    });
  });

  describe('real-world examples', () => {
    it('should format YouTube video title correctly', () => {
      expect(formatFilename('Rick Astley - Never Gonna Give You Up (Official Video)', 'compact'))
        .toBe('rick-astley---never-gonna-give-you-up-official-video');
    });

    it('should handle playlist video with episode number', () => {
      expect(formatFilename('Episode 5: The Big Reveal!', 'kebab'))
        .toBe('Episode-5-The-Big-Reveal!');
    });

    it('should format dated video title', () => {
      expect(formatFilename('Daily Vlog - 2024/01/15', 'snake'))
        .toBe('daily_vlog_20240115');
    });
  });
});

describe('sanitizeFilename', () => {
  it('should use compact format', () => {
    expect(sanitizeFilename('My Video Title')).toBe('my-video-title');
  });

  it('should respect maxLength parameter', () => {
    const longTitle = 'A'.repeat(300);
    const result = sanitizeFilename(longTitle, 50);
    expect(result.length).toBe(50);
  });

  it('should default to 200 character limit', () => {
    const longTitle = 'A'.repeat(300);
    const result = sanitizeFilename(longTitle);
    expect(result.length).toBe(200);
  });
});

describe('createPlaylistFilename', () => {
  it('should default to sequential-prefix format', () => {
    expect(createPlaylistFilename('My Video', 0)).toBe('001-my-video');
  });

  it('should accept custom format', () => {
    expect(createPlaylistFilename('My Video', 5, 'sequential-suffix')).toBe('my-video-006');
  });

  it('should accept custom maxLength', () => {
    const longTitle = 'A'.repeat(300);
    const result = createPlaylistFilename(longTitle, 0, 'sequential-prefix', 50);
    expect(result.length).toBeLessThanOrEqual(50);
  });

  it('should handle various formats', () => {
    expect(createPlaylistFilename('My Video', 0, 'compact')).toBe('my-video');
    expect(createPlaylistFilename('My Video', 0, 'original')).toBe('My Video');
    expect(createPlaylistFilename('My Video', 0, 'kebab')).toBe('My-Video');
  });
});
