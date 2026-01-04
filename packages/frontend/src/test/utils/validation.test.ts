import { describe, it, expect } from 'vitest';
import {
  validateYouTubeVideoUrl,
  validateYouTubePlaylistUrl,
  sanitizeScriptOptions,
  validateDuration,
} from '@/utils/validation';

describe('validateYouTubeVideoUrl', () => {
  it('should validate standard youtube.com video URLs', () => {
    const result = validateYouTubeVideoUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should validate www.youtube.com video URLs', () => {
    const result = validateYouTubeVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.valid).toBe(true);
  });

  it('should validate m.youtube.com video URLs', () => {
    const result = validateYouTubeVideoUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.valid).toBe(true);
  });

  it('should validate youtu.be short URLs', () => {
    const result = validateYouTubeVideoUrl('https://youtu.be/dQw4w9WgXcQ');
    expect(result.valid).toBe(true);
  });

  it('should accept http protocol', () => {
    const result = validateYouTubeVideoUrl('http://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.valid).toBe(true);
  });

  it('should reject empty URL', () => {
    const result = validateYouTubeVideoUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL is required');
  });

  it('should reject invalid URL format', () => {
    const result = validateYouTubeVideoUrl('not a url');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid URL format');
  });

  it('should reject non-YouTube domains', () => {
    const result = validateYouTubeVideoUrl('https://vimeo.com/123456');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must be from YouTube');
  });

  it('should reject invalid protocol', () => {
    const result = validateYouTubeVideoUrl('ftp://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must use HTTP or HTTPS protocol');
  });

  it('should reject missing video ID', () => {
    const result = validateYouTubeVideoUrl('https://youtube.com/watch');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid or missing video ID parameter');
  });

  it('should reject invalid video ID format', () => {
    const result = validateYouTubeVideoUrl('https://youtube.com/watch?v=abc');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid or missing video ID parameter');
  });

  it('should reject playlist URLs', () => {
    const result = validateYouTubeVideoUrl('https://youtube.com/playlist?list=PLtest123');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must be a YouTube video URL');
  });

  it('should reject null or undefined', () => {
    const result1 = validateYouTubeVideoUrl(null as any);
    expect(result1.valid).toBe(false);
    expect(result1.error).toBe('URL is required');

    const result2 = validateYouTubeVideoUrl(undefined as any);
    expect(result2.valid).toBe(false);
    expect(result2.error).toBe('URL is required');
  });
});

describe('validateYouTubePlaylistUrl', () => {
  it('should validate standard youtube.com playlist URLs', () => {
    const result = validateYouTubePlaylistUrl('https://youtube.com/playlist?list=PLtest123');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should validate www.youtube.com playlist URLs', () => {
    const result = validateYouTubePlaylistUrl('https://www.youtube.com/playlist?list=PLtest123');
    expect(result.valid).toBe(true);
  });

  it('should validate m.youtube.com playlist URLs', () => {
    const result = validateYouTubePlaylistUrl('https://m.youtube.com/playlist?list=PLtest123');
    expect(result.valid).toBe(true);
  });

  it('should accept http protocol', () => {
    const result = validateYouTubePlaylistUrl('http://youtube.com/playlist?list=PLtest123');
    expect(result.valid).toBe(true);
  });

  it('should reject empty URL', () => {
    const result = validateYouTubePlaylistUrl('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL is required');
  });

  it('should reject invalid URL format', () => {
    const result = validateYouTubePlaylistUrl('not a url');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid URL format');
  });

  it('should reject non-YouTube domains', () => {
    const result = validateYouTubePlaylistUrl('https://vimeo.com/playlist/123456');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must be from YouTube');
  });

  it('should reject youtu.be short URLs for playlists', () => {
    const result = validateYouTubePlaylistUrl('https://youtu.be/PLtest123');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must be from YouTube');
  });

  it('should reject invalid protocol', () => {
    const result = validateYouTubePlaylistUrl('ftp://youtube.com/playlist?list=PLtest123');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must use HTTP or HTTPS protocol');
  });

  it('should reject missing playlist ID', () => {
    const result = validateYouTubePlaylistUrl('https://youtube.com/playlist');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid or missing playlist ID parameter');
  });

  it('should reject video URLs', () => {
    const result = validateYouTubePlaylistUrl('https://youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('URL must be a YouTube playlist URL');
  });

  it('should reject null or undefined', () => {
    const result1 = validateYouTubePlaylistUrl(null as any);
    expect(result1.valid).toBe(false);
    expect(result1.error).toBe('URL is required');

    const result2 = validateYouTubePlaylistUrl(undefined as any);
    expect(result2.valid).toBe(false);
    expect(result2.error).toBe('URL is required');
  });
});

describe('sanitizeScriptOptions', () => {
  it('should return safe script options unchanged', () => {
    const result = sanitizeScriptOptions('--hls-use-mpegts');
    expect(result).toBe('--hls-use-mpegts');
  });

  it('should allow alphanumeric and safe characters', () => {
    const result = sanitizeScriptOptions('yt-dlp {VIDEO_URL} -o -');
    expect(result).toBe('yt-dlp {VIDEO_URL} -o -');
  });

  it('should remove shell metacharacters', () => {
    const result = sanitizeScriptOptions('--flag; rm -rf /');
    expect(result).toBe('--flag rm -rf /');
  });

  it('should remove backticks', () => {
    const result = sanitizeScriptOptions('--flag `malicious`');
    expect(result).toBe('--flag malicious');
  });

  it('should remove pipes', () => {
    const result = sanitizeScriptOptions('--flag | cat /etc/passwd');
    expect(result).toBe('--flag  cat /etc/passwd');
  });

  it('should remove ampersands', () => {
    const result = sanitizeScriptOptions('--flag && malicious');
    expect(result).toBe('--flag  malicious');
  });

  it('should remove null bytes', () => {
    const result = sanitizeScriptOptions('--flag\0malicious');
    expect(result).toBe('--flagmalicious');
  });

  it('should trim whitespace', () => {
    const result = sanitizeScriptOptions('  --hls-use-mpegts  ');
    expect(result).toBe('--hls-use-mpegts');
  });

  it('should handle empty string', () => {
    const result = sanitizeScriptOptions('');
    expect(result).toBe('');
  });

  it('should handle null or undefined', () => {
    const result1 = sanitizeScriptOptions(null as any);
    expect(result1).toBe('');

    const result2 = sanitizeScriptOptions(undefined as any);
    expect(result2).toBe('');
  });
});

describe('validateDuration', () => {
  it('should validate correct HH:MM:SS format', () => {
    const result = validateDuration('01:23:45');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should validate zero duration', () => {
    const result = validateDuration('00:00:00');
    expect(result.valid).toBe(true);
  });

  it('should validate max valid time', () => {
    const result = validateDuration('23:59:59');
    expect(result.valid).toBe(true);
  });

  it('should reject empty duration', () => {
    const result = validateDuration('');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Duration is required');
  });

  it('should reject invalid format', () => {
    const result = validateDuration('1:2:3');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Duration must be in HH:MM:SS format');
  });

  it('should reject hours over 23', () => {
    const result = validateDuration('24:00:00');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Hours must be between 00 and 23');
  });

  it('should reject invalid minutes', () => {
    const result = validateDuration('12:60:30');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Duration must be in HH:MM:SS format');
  });

  it('should reject invalid seconds', () => {
    const result = validateDuration('12:30:60');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Duration must be in HH:MM:SS format');
  });

  it('should reject non-string values', () => {
    const result1 = validateDuration(null as any);
    expect(result1.valid).toBe(false);
    expect(result1.error).toBe('Duration is required');

    const result2 = validateDuration(undefined as any);
    expect(result2.valid).toBe(false);
    expect(result2.error).toBe('Duration is required');
  });
});
