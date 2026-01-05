import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertVideo, convertPlaylist } from '../../services/api';
import type {
  ConvertVideoRequest,
  ConvertVideoResponse,
  ConvertPlaylistRequest,
  ConvertPlaylistResponse,
} from '@youtube-to-ersatztv/shared';

// Mock fetch
globalThis.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('convertVideo', () => {
    const mockRequest: ConvertVideoRequest = {
      url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
      durationMode: 'api',
      scriptOptions: 'yt-dlp {VIDEO_URL} -o -',
    };

    it('should successfully convert video with API response', async () => {
      const mockResponse: ConvertVideoResponse = {
        yaml: 'video:\n  title: "Test Video"\n  duration: "00:03:33"',
        metadata: {
          title: 'Test Video',
          description: 'Test description',
          duration: '00:03:33',
          isLive: false,
          videoId: 'dQw4w9WgXcQ',
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await convertVideo(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8787/api/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      });
    });

    it('should handle different duration modes', async () => {
      const noneRequest: ConvertVideoRequest = {
        url: 'https://youtube.com/watch?v=test123',
        durationMode: 'none',
        scriptOptions: 'yt-dlp {VIDEO_URL} -o -',
      };

      const mockResponse: ConvertVideoResponse = {
        yaml: 'video: test',
        metadata: {
          title: 'Test',
          description: '',
          duration: '00:00:00',
          isLive: true,
          videoId: 'test123',
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await convertVideo(noneRequest);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(noneRequest),
        })
      );
    });

    it('should throw error when API returns error response', async () => {
      const errorResponse = {
        message: 'Invalid video URL',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorResponse,
      } as Response);

      await expect(convertVideo(mockRequest)).rejects.toThrow('Invalid video URL');
    });

    it('should throw generic error when error response has no message', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(convertVideo(mockRequest)).rejects.toThrow('Failed to convert video');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      await expect(convertVideo(mockRequest)).rejects.toThrow('Network error');
    });

    it('should handle 404 not found', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Video not found' }),
      } as Response);

      await expect(convertVideo(mockRequest)).rejects.toThrow('Video not found');
    });

    it('should handle 403 forbidden (API key issues)', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        json: async () => ({ message: 'YouTube API key invalid' }),
      } as Response);

      await expect(convertVideo(mockRequest)).rejects.toThrow('YouTube API key invalid');
    });

    it('should handle 429 rate limit with retry after header', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '60' }),
        json: async () => ({ message: 'Rate limit exceeded. Please try again in 60 seconds.' }),
      } as Response);

      await expect(convertVideo(mockRequest)).rejects.toThrow(
        'Rate limit exceeded. Please try again in 60 seconds. Please wait 60 seconds before trying again.'
      );
    });

    it('should handle 429 rate limit without retry after header', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers(),
        json: async () => ({ message: 'Rate limit exceeded' }),
      } as Response);

      await expect(convertVideo(mockRequest)).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle custom duration mode', async () => {
      const customRequest: ConvertVideoRequest = {
        url: 'https://youtube.com/watch?v=test',
        durationMode: 'custom',
        customDuration: '01:30:00',
        scriptOptions: 'yt-dlp {VIDEO_URL} -o -',
      };

      const mockResponse: ConvertVideoResponse = {
        yaml: 'duration: "01:30:00"',
        metadata: {
          title: 'Custom Duration Video',
          description: '',
          duration: '01:30:00',
          isLive: false,
          videoId: 'test',
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await convertVideo(customRequest);

      expect(result).toEqual(mockResponse);
    });

    it('should handle api-padded mode with padding intervals', async () => {
      const paddedRequest: ConvertVideoRequest = {
        url: 'https://youtube.com/watch?v=test',
        durationMode: 'api-padded',
        paddingInterval: 15,
        scriptOptions: 'yt-dlp {VIDEO_URL} -o -',
      };

      const mockResponse: ConvertVideoResponse = {
        yaml: 'duration: "00:15:00"',
        metadata: {
          title: 'Padded Video',
          description: '',
          duration: '00:15:00',
          isLive: false,
          videoId: 'test',
        },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await convertVideo(paddedRequest);

      expect(result.metadata.duration).toBe('00:15:00');
    });
  });

  describe('convertPlaylist', () => {
    const mockRequest: ConvertPlaylistRequest = {
      url: 'https://youtube.com/playlist?list=PLtest',
      durationMode: 'api',
      scriptOptions: 'yt-dlp {VIDEO_URL} -o -',
    };

    it('should successfully convert playlist with multiple videos', async () => {
      const mockResponse: ConvertPlaylistResponse = {
        videos: [
          {
            filename: '001-video-1.yaml',
            yaml: 'video: 1',
            metadata: {
              title: 'Video 1',
              description: '',
              duration: '00:05:00',
              isLive: false,
              videoId: 'vid1',
            },
          },
          {
            filename: '002-video-2.yaml',
            yaml: 'video: 2',
            metadata: {
              title: 'Video 2',
              description: '',
              duration: '00:10:00',
              isLive: false,
              videoId: 'vid2',
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await convertPlaylist(mockRequest);

      expect(result).toEqual(mockResponse);
      expect(result.videos).toHaveLength(2);
      expect(fetch).toHaveBeenCalledWith('http://localhost:8787/api/convert/playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      });
    });

    it('should handle empty playlist response', async () => {
      const mockResponse: ConvertPlaylistResponse = {
        videos: [],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await convertPlaylist(mockRequest);

      expect(result.videos).toHaveLength(0);
    });

    it('should handle different filename formats', async () => {
      const compactRequest: ConvertPlaylistRequest = {
        ...mockRequest,
      };

      const mockResponse: ConvertPlaylistResponse = {
        videos: [
          {
            filename: 'test-video.yaml',
            yaml: 'content',
            metadata: {
              title: 'Test Video',
              description: '',
              duration: '00:05:00',
              isLive: false,
              videoId: 'test',
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      await convertPlaylist(compactRequest);

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(compactRequest),
        })
      );
    });

    it('should throw error when API returns error response', async () => {
      const errorResponse = {
        message: 'Playlist not found',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      } as Response);

      await expect(convertPlaylist(mockRequest)).rejects.toThrow('Playlist not found');
    });

    it('should throw generic error when error response has no message', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      } as Response);

      await expect(convertPlaylist(mockRequest)).rejects.toThrow('Failed to convert playlist');
    });

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Connection timeout'));

      await expect(convertPlaylist(mockRequest)).rejects.toThrow('Connection timeout');
    });

    it('should handle partial success in playlist (some videos fail)', async () => {
      const mockResponse: ConvertPlaylistResponse = {
        videos: [
          {
            filename: '001-success.yaml',
            yaml: 'success',
            metadata: {
              title: 'Success Video',
              description: '',
              duration: '00:05:00',
              isLive: false,
              videoId: 'success',
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await convertPlaylist(mockRequest);

      expect(result.videos).toHaveLength(1);
    });

    it('should handle validation errors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          message: 'Invalid duration mode',
        }),
      } as Response);

      await expect(convertPlaylist(mockRequest)).rejects.toThrow('Invalid duration mode');
    });

    it('should handle server errors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({
          message: 'YouTube API quota exceeded',
        }),
      } as Response);

      await expect(convertPlaylist(mockRequest)).rejects.toThrow('YouTube API quota exceeded');
    });

    it('should handle 429 rate limit with retry after header', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers({ 'Retry-After': '45' }),
        json: async () => ({ message: 'Too many playlist requests' }),
      } as Response);

      await expect(convertPlaylist(mockRequest)).rejects.toThrow(
        'Too many playlist requests Please wait 45 seconds before trying again.'
      );
    });

    it('should handle 429 rate limit without retry after header', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 429,
        headers: new Headers(),
        json: async () => ({ message: 'Rate limit exceeded' }),
      } as Response);

      await expect(convertPlaylist(mockRequest)).rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('API URL configuration', () => {
    it('should use default API URL when VITE_API_URL is not set', async () => {
      const mockRequest: ConvertVideoRequest = {
        url: 'https://youtube.com/watch?v=test',
        durationMode: 'none',
        scriptOptions: 'yt-dlp {VIDEO_URL} -o -',
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ yaml: 'test', metadata: {} as any }),
      } as Response);

      await convertVideo(mockRequest);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('http://localhost:8787'),
        expect.any(Object)
      );
    });
  });
});
