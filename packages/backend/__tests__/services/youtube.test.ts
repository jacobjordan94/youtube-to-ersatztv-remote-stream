import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getVideoMetadata, getPlaylistVideoIds } from '../../src/services/youtube';
import * as cache from '../../src/services/cache';
import type { Env } from '../../src/types';
import type { YouTubeApiResponse, YouTubePlaylistResponse } from '@youtube-to-ersatztv/shared';

// Mock the cache module
vi.mock('../../src/services/cache', () => ({
  getCachedData: vi.fn(),
  setCachedData: vi.fn(),
}));

// Mock fetch
globalThis.fetch = vi.fn();

describe('YouTube Service', () => {
  const mockEnv: Env = {
    YOUTUBE_API_KEY: 'test-api-key',
    ENVIRONMENT: 'test',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVideoMetadata', () => {
    const mockVideoId = 'dQw4w9WgXcQ';

    it('should return cached metadata if available', async () => {
      const cachedMetadata = {
        title: 'Cached Video',
        description: 'Cached description',
        duration: '00:03:33',
        isLive: false,
        videoId: mockVideoId,
      };

      vi.mocked(cache.getCachedData).mockResolvedValue(cachedMetadata);

      const result = await getVideoMetadata(mockVideoId, mockEnv);

      expect(result).toEqual(cachedMetadata);
      expect(cache.getCachedData).toHaveBeenCalledWith(`video:${mockVideoId}`, mockEnv);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache metadata for VOD video', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubeApiResponse = {
        items: [
          {
            id: mockVideoId,
            snippet: {
              title: 'Never Gonna Give You Up',
              description: 'Official Music Video',
            },
            contentDetails: {
              duration: 'PT3M33S',
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getVideoMetadata(mockVideoId, mockEnv);

      expect(result).toEqual({
        title: 'Never Gonna Give You Up',
        description: 'Official Music Video',
        duration: '00:03:33',
        isLive: false,
        videoId: mockVideoId,
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('videos')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`id=${mockVideoId}`)
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('key=test-api-key')
      );

      expect(cache.setCachedData).toHaveBeenCalledWith(
        `video:${mockVideoId}`,
        expect.objectContaining({ title: 'Never Gonna Give You Up' }),
        mockEnv,
        3600
      );
    });

    it('should detect active livestream (has actualStartTime, no actualEndTime)', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubeApiResponse = {
        items: [
          {
            id: mockVideoId,
            snippet: {
              title: 'Live Stream Now',
              description: 'Currently streaming',
            },
            contentDetails: {
              duration: 'PT0S',
            },
            liveStreamingDetails: {
              actualStartTime: '2024-01-01T12:00:00Z',
              // No actualEndTime means still live
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getVideoMetadata(mockVideoId, mockEnv);

      expect(result.isLive).toBe(true);
    });

    it('should detect finished livestream as VOD (has actualEndTime)', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubeApiResponse = {
        items: [
          {
            id: mockVideoId,
            snippet: {
              title: 'Past Livestream',
              description: 'Finished streaming',
            },
            contentDetails: {
              duration: 'PT2H30M15S',
            },
            liveStreamingDetails: {
              actualStartTime: '2024-01-01T12:00:00Z',
              actualEndTime: '2024-01-01T14:30:15Z',
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getVideoMetadata(mockVideoId, mockEnv);

      expect(result.isLive).toBe(false);
      expect(result.duration).toBe('02:30:15');
    });

    it('should detect scheduled livestream as not live (no actualStartTime)', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubeApiResponse = {
        items: [
          {
            id: mockVideoId,
            snippet: {
              title: 'Upcoming Livestream',
              description: 'Scheduled for later',
            },
            contentDetails: {
              duration: 'PT0S',
            },
            liveStreamingDetails: {
              scheduledStartTime: '2024-12-31T20:00:00Z',
              // No actualStartTime means not started yet
            },
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getVideoMetadata(mockVideoId, mockEnv);

      expect(result.isLive).toBe(false);
    });

    it('should handle video without liveStreamingDetails', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubeApiResponse = {
        items: [
          {
            id: mockVideoId,
            snippet: {
              title: 'Regular Video',
              description: 'Not a livestream',
            },
            contentDetails: {
              duration: 'PT10M5S',
            },
            // No liveStreamingDetails at all
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getVideoMetadata(mockVideoId, mockEnv);

      expect(result.isLive).toBe(false);
    });

    it('should throw error when API returns non-OK status', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      } as Response);

      await expect(getVideoMetadata(mockVideoId, mockEnv)).rejects.toThrow(
        'YouTube API error: 403 Forbidden'
      );
    });

    it('should throw error when video not found (empty items)', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubeApiResponse = {
        items: [],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await expect(getVideoMetadata(mockVideoId, mockEnv)).rejects.toThrow(
        `Video not found: ${mockVideoId}`
      );
    });

    it('should handle API response with missing items property', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(getVideoMetadata(mockVideoId, mockEnv)).rejects.toThrow(
        `Video not found: ${mockVideoId}`
      );
    });
  });

  describe('getPlaylistVideoIds', () => {
    const mockPlaylistId = 'PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf';

    it('should return cached video IDs if available', async () => {
      const cachedIds = ['video1', 'video2', 'video3'];

      vi.mocked(cache.getCachedData).mockResolvedValue(cachedIds);

      const result = await getPlaylistVideoIds(mockPlaylistId, mockEnv);

      expect(result).toEqual(cachedIds);
      expect(cache.getCachedData).toHaveBeenCalledWith(`playlist:${mockPlaylistId}`, mockEnv);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should fetch and cache single page of playlist video IDs', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubePlaylistResponse = {
        items: [
          { snippet: { resourceId: { videoId: 'video1' } } },
          { snippet: { resourceId: { videoId: 'video2' } } },
          { snippet: { resourceId: { videoId: 'video3' } } },
        ],
        // No nextPageToken means single page
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getPlaylistVideoIds(mockPlaylistId, mockEnv);

      expect(result).toEqual(['video1', 'video2', 'video3']);
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('playlistItems')
      );
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`playlistId=${mockPlaylistId}`)
      );

      expect(cache.setCachedData).toHaveBeenCalledWith(
        `playlist:${mockPlaylistId}`,
        ['video1', 'video2', 'video3'],
        mockEnv,
        1800
      );
    });

    it('should paginate through multiple pages of playlist results', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      // First page with nextPageToken
      const page1Response: YouTubePlaylistResponse = {
        items: [
          { snippet: { resourceId: { videoId: 'video1' } } },
          { snippet: { resourceId: { videoId: 'video2' } } },
        ],
        nextPageToken: 'token123',
      };

      // Second page with nextPageToken
      const page2Response: YouTubePlaylistResponse = {
        items: [
          { snippet: { resourceId: { videoId: 'video3' } } },
          { snippet: { resourceId: { videoId: 'video4' } } },
        ],
        nextPageToken: 'token456',
      };

      // Third page without nextPageToken (last page)
      const page3Response: YouTubePlaylistResponse = {
        items: [
          { snippet: { resourceId: { videoId: 'video5' } } },
        ],
        // No nextPageToken means last page
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1Response,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2Response,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page3Response,
        } as Response);

      const result = await getPlaylistVideoIds(mockPlaylistId, mockEnv);

      expect(result).toEqual(['video1', 'video2', 'video3', 'video4', 'video5']);
      expect(fetch).toHaveBeenCalledTimes(3);

      // Verify pageToken was used in subsequent requests
      const calls = vi.mocked(fetch).mock.calls;
      expect(calls[0][0]).not.toContain('pageToken');
      expect(calls[1][0]).toContain('pageToken=token123');
      expect(calls[2][0]).toContain('pageToken=token456');
    });

    it('should handle maxResults parameter correctly', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubePlaylistResponse = {
        items: [
          { snippet: { resourceId: { videoId: 'video1' } } },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await getPlaylistVideoIds(mockPlaylistId, mockEnv);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('maxResults=50')
      );
    });

    it('should throw error when API returns non-OK status', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(getPlaylistVideoIds(mockPlaylistId, mockEnv)).rejects.toThrow(
        'YouTube API error: 404 Not Found'
      );
    });

    it('should throw error when playlist is empty', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      const mockApiResponse: YouTubePlaylistResponse = {
        items: [],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

      await expect(getPlaylistVideoIds(mockPlaylistId, mockEnv)).rejects.toThrow(
        `Playlist not found or empty: ${mockPlaylistId}`
      );
    });

    it('should throw error when playlist has no items property', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      } as Response);

      await expect(getPlaylistVideoIds(mockPlaylistId, mockEnv)).rejects.toThrow(
        `Playlist not found or empty: ${mockPlaylistId}`
      );
    });

    it('should stop pagination if a page returns empty items', async () => {
      vi.mocked(cache.getCachedData).mockResolvedValue(null);

      // First page with data and nextPageToken
      const page1Response: YouTubePlaylistResponse = {
        items: [
          { snippet: { resourceId: { videoId: 'video1' } } },
        ],
        nextPageToken: 'token123',
      };

      // Second page returns empty (edge case)
      const page2Response: YouTubePlaylistResponse = {
        items: [],
      };

      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page1Response,
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => page2Response,
        } as Response);

      const result = await getPlaylistVideoIds(mockPlaylistId, mockEnv);

      expect(result).toEqual(['video1']);
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
