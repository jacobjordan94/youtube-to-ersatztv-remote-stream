import { describe, it, expect } from 'vitest';
import {
  parseYouTubeUrl,
  validateScriptOptions,
  sanitizeFilename,
} from '../../src/utils/validators';

describe('parseYouTubeUrl', () => {
  describe('video URLs', () => {
    it('should parse standard youtube.com/watch URLs', () => {
      const result = parseYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toEqual({ type: 'video', id: 'dQw4w9WgXcQ' });
    });

    it('should parse www.youtube.com/watch URLs', () => {
      const result = parseYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toEqual({ type: 'video', id: 'dQw4w9WgXcQ' });
    });

    it('should parse youtu.be short URLs', () => {
      const result = parseYouTubeUrl('https://youtu.be/dQw4w9WgXcQ');
      expect(result).toEqual({ type: 'video', id: 'dQw4w9WgXcQ' });
    });

    it('should parse URLs with additional query parameters', () => {
      const result = parseYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ&t=30s');
      expect(result).toEqual({ type: 'video', id: 'dQw4w9WgXcQ' });
    });

    it('should parse http URLs (not just https)', () => {
      const result = parseYouTubeUrl('http://youtube.com/watch?v=dQw4w9WgXcQ');
      expect(result).toEqual({ type: 'video', id: 'dQw4w9WgXcQ' });
    });
  });

  describe('playlist URLs', () => {
    it('should parse standard playlist URLs', () => {
      const result = parseYouTubeUrl(
        'https://youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'
      );
      expect(result).toEqual({ type: 'playlist', id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf' });
    });

    it('should parse www.youtube.com playlist URLs', () => {
      const result = parseYouTubeUrl(
        'https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf'
      );
      expect(result).toEqual({ type: 'playlist', id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf' });
    });

    it('should parse playlist URLs with additional parameters', () => {
      const result = parseYouTubeUrl(
        'https://youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf&index=1'
      );
      expect(result).toEqual({ type: 'playlist', id: 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf' });
    });
  });

  describe('invalid URLs', () => {
    it('should return null for non-YouTube URLs', () => {
      expect(parseYouTubeUrl('https://example.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    });

    it('should return null for malformed YouTube URLs', () => {
      expect(parseYouTubeUrl('https://youtube.com/invalid')).toBeNull();
    });

    it('should return null for empty strings', () => {
      expect(parseYouTubeUrl('')).toBeNull();
    });

    it('should return null for URLs missing video ID', () => {
      expect(parseYouTubeUrl('https://youtube.com/watch')).toBeNull();
    });
  });
});

describe('validateScriptOptions', () => {
  describe('valid options', () => {
    it('should accept valid script with required -o - flag', () => {
      const result = validateScriptOptions(
        'yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -'
      );
      expect(result).toEqual({ valid: true });
    });

    it('should accept script with multiple valid flags', () => {
      const result = validateScriptOptions(
        'yt-dlp {VIDEO_URL} --hls-use-mpegts --no-warnings -o -'
      );
      expect(result).toEqual({ valid: true });
    });

    it('should accept script with just -o -', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} -o -');
      expect(result).toEqual({ valid: true });
    });
  });

  describe('missing required flag', () => {
    it('should reject script without -o - flag', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} --hls-use-mpegts');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('-o -');
    });
  });

  describe('prohibited flags', () => {
    it('should reject script with -f flag', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} -f best -o -');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('-f');
    });

    it('should reject script with --format flag', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} --format best -o -');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('-f'); // --format contains -f, so it matches first
    });

    it('should reject script with --extract-audio flag', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} --extract-audio -o -');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('--extract-audio');
    });

    it('should reject script with --output flag', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} --output file.mp4 -o -');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('--output');
    });
  });

  describe('command injection attempts', () => {
    it('should reject scripts with semicolon command chaining', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} -o -; rm -rf /');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dangerous');
    });

    it('should reject scripts with && command chaining', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} -o - && cat /etc/passwd');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dangerous');
    });

    it('should reject scripts with || command chaining', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} -o - || echo hacked');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dangerous');
    });

    it('should reject scripts with backtick command substitution', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} -o - `whoami`');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dangerous');
    });

    it('should reject scripts with $() command substitution', () => {
      const result = validateScriptOptions('yt-dlp {VIDEO_URL} -o - $(whoami)');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('dangerous');
    });
  });
});

describe('sanitizeFilename', () => {
  it('should convert spaces to hyphens', () => {
    expect(sanitizeFilename('My Video Title')).toBe('my-video-title');
  });

  it('should convert to lowercase', () => {
    expect(sanitizeFilename('UPPERCASE VIDEO')).toBe('uppercase-video');
  });

  it('should remove special characters', () => {
    expect(sanitizeFilename('Video@Title!With#Special$Chars')).toBe('videotitlewithspecialchars');
  });

  it('should preserve alphanumeric characters', () => {
    expect(sanitizeFilename('Video123Title456')).toBe('video123title456');
  });

  it('should collapse multiple spaces into single hyphen', () => {
    expect(sanitizeFilename('Video    With    Spaces')).toBe('video-with-spaces');
  });

  it('should collapse multiple hyphens into single hyphen', () => {
    expect(sanitizeFilename('Video---With---Hyphens')).toBe('video-with-hyphens');
  });

  it('should handle empty string', () => {
    expect(sanitizeFilename('')).toBe('');
  });

  it('should truncate long filenames to 200 characters', () => {
    const longString = 'a'.repeat(300);
    const result = sanitizeFilename(longString);
    expect(result.length).toBe(200);
  });

  it('should remove invalid filename characters (/, \\, :, *, ?, ", <, >, |)', () => {
    expect(sanitizeFilename('Invalid/\\:*?"<>|Chars')).toBe('invalidchars');
  });

  it('should handle mixed case with special chars and spaces', () => {
    expect(sanitizeFilename('My Cool Video! (2024)')).toBe('my-cool-video-2024');
  });
});
