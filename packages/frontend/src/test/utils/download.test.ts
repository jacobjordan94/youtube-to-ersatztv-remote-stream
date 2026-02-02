import { describe, it, expect } from 'vitest';
import { getThumbnailUrl, getThumbnailExtension } from '../../utils/download';
import type { Thumbnails } from '@youtube-to-ersatztv/shared';

describe('getThumbnailUrl', () => {
  const allThumbnails: Thumbnails = {
    default: { url: 'https://example.com/default.jpg', width: 120, height: 90 },
    medium: { url: 'https://example.com/medium.jpg', width: 320, height: 180 },
    high: { url: 'https://example.com/high.jpg', width: 480, height: 360 },
    standard: { url: 'https://example.com/standard.jpg', width: 640, height: 480 },
    maxres: { url: 'https://example.com/maxres.jpg', width: 1280, height: 720 },
  };

  describe('highest resolution', () => {
    it('should return maxres when available', () => {
      expect(getThumbnailUrl(allThumbnails, 'highest')).toBe('https://example.com/maxres.jpg');
    });

    it('should fall back to standard when maxres is not available', () => {
      const thumbnails: Thumbnails = {
        default: { url: 'https://example.com/default.jpg', width: 120, height: 90 },
        standard: { url: 'https://example.com/standard.jpg', width: 640, height: 480 },
      };
      expect(getThumbnailUrl(thumbnails, 'highest')).toBe('https://example.com/standard.jpg');
    });

    it('should return first available when only one exists', () => {
      const thumbnails: Thumbnails = {
        medium: { url: 'https://example.com/medium.jpg', width: 320, height: 180 },
      };
      expect(getThumbnailUrl(thumbnails, 'highest')).toBe('https://example.com/medium.jpg');
    });
  });

  describe('lowest resolution', () => {
    it('should return default when available', () => {
      expect(getThumbnailUrl(allThumbnails, 'lowest')).toBe('https://example.com/default.jpg');
    });

    it('should fall back to medium when default is not available', () => {
      const thumbnails: Thumbnails = {
        medium: { url: 'https://example.com/medium.jpg', width: 320, height: 180 },
        high: { url: 'https://example.com/high.jpg', width: 480, height: 360 },
      };
      expect(getThumbnailUrl(thumbnails, 'lowest')).toBe('https://example.com/medium.jpg');
    });

    it('should return only available when just one exists', () => {
      const thumbnails: Thumbnails = {
        maxres: { url: 'https://example.com/maxres.jpg', width: 1280, height: 720 },
      };
      expect(getThumbnailUrl(thumbnails, 'lowest')).toBe('https://example.com/maxres.jpg');
    });
  });

  describe('specific resolutions', () => {
    it('should return exact resolution when available', () => {
      expect(getThumbnailUrl(allThumbnails, 'standard')).toBe('https://example.com/standard.jpg');
      expect(getThumbnailUrl(allThumbnails, 'high')).toBe('https://example.com/high.jpg');
      expect(getThumbnailUrl(allThumbnails, 'medium')).toBe('https://example.com/medium.jpg');
    });

    it('should fall back to lower resolution when requested is not available', () => {
      const thumbnails: Thumbnails = {
        default: { url: 'https://example.com/default.jpg', width: 120, height: 90 },
        medium: { url: 'https://example.com/medium.jpg', width: 320, height: 180 },
      };
      // Requesting 'maxres' should fall back through the chain
      expect(getThumbnailUrl(thumbnails, 'maxres')).toBe('https://example.com/medium.jpg');
    });

    it('should return undefined when no matching or lower resolution exists', () => {
      const thumbnails: Thumbnails = {
        maxres: { url: 'https://example.com/maxres.jpg', width: 1280, height: 720 },
      };
      // Requesting 'default' with only maxres available - no fallback since default is lowest
      expect(getThumbnailUrl(thumbnails, 'default')).toBe(undefined);
    });
  });

  describe('edge cases', () => {
    it('should return undefined for undefined thumbnails', () => {
      expect(getThumbnailUrl(undefined, 'highest')).toBe(undefined);
      expect(getThumbnailUrl(undefined, 'lowest')).toBe(undefined);
      expect(getThumbnailUrl(undefined, 'standard')).toBe(undefined);
    });

    it('should return undefined for empty thumbnails object', () => {
      expect(getThumbnailUrl({}, 'highest')).toBe(undefined);
      expect(getThumbnailUrl({}, 'lowest')).toBe(undefined);
    });

    it('should skip thumbnails with undefined url', () => {
      const thumbnails: Thumbnails = {
        maxres: { url: '', width: 1280, height: 720 }, // Empty URL should be skipped
        standard: { url: 'https://example.com/standard.jpg', width: 640, height: 480 },
      };
      expect(getThumbnailUrl(thumbnails, 'highest')).toBe('https://example.com/standard.jpg');
    });
  });
});

describe('getThumbnailExtension', () => {
  it('should extract jpg extension', () => {
    expect(getThumbnailExtension('https://example.com/image.jpg')).toBe('jpg');
    expect(getThumbnailExtension('https://example.com/image.JPG')).toBe('jpg');
  });

  it('should extract jpeg extension', () => {
    expect(getThumbnailExtension('https://example.com/image.jpeg')).toBe('jpeg');
  });

  it('should extract png extension', () => {
    expect(getThumbnailExtension('https://example.com/image.png')).toBe('png');
  });

  it('should extract webp extension', () => {
    expect(getThumbnailExtension('https://example.com/image.webp')).toBe('webp');
  });

  it('should handle URLs with query parameters', () => {
    expect(getThumbnailExtension('https://example.com/image.jpg?quality=high')).toBe('jpg');
    expect(getThumbnailExtension('https://example.com/image.png?v=123')).toBe('png');
  });

  it('should default to jpg for unrecognized extensions', () => {
    expect(getThumbnailExtension('https://example.com/image')).toBe('jpg');
    expect(getThumbnailExtension('https://example.com/image.gif')).toBe('jpg');
    expect(getThumbnailExtension('https://example.com/image.bmp')).toBe('jpg');
  });

  it('should handle YouTube thumbnail URLs', () => {
    expect(getThumbnailExtension('https://i.ytimg.com/vi/abc123/maxresdefault.jpg')).toBe('jpg');
    expect(getThumbnailExtension('https://i.ytimg.com/vi/abc123/hqdefault.webp')).toBe('webp');
  });
});
