import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCachedData, setCachedData } from '../../src/services/cache';
import type { Env } from '../../src/types';

describe('Cache Service', () => {
  let mockEnv: Env;
  let mockCache: any;
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    // Mock console methods to avoid noise in test output
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create mock KV namespace
    mockCache = {
      get: vi.fn(),
      put: vi.fn(),
    };

    mockEnv = {
      YOUTUBE_API_KEY: 'test-key',
      CACHE: mockCache,
      ENVIRONMENT: 'test',
    };
  });

  describe('getCachedData', () => {
    it('should return null when CACHE is undefined', async () => {
      const envWithoutCache: Env = {
        YOUTUBE_API_KEY: 'test-key',
        ENVIRONMENT: 'test',
      };

      const result = await getCachedData('test-key', envWithoutCache);

      expect(result).toBeNull();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should return cached data when cache hit occurs', async () => {
      const cachedData = { foo: 'bar', count: 42 };
      mockCache.get.mockResolvedValue(cachedData);

      const result = await getCachedData<typeof cachedData>('test-key', mockEnv);

      expect(result).toEqual(cachedData);
      expect(mockCache.get).toHaveBeenCalledWith('test-key', 'json');
      expect(consoleLogSpy).toHaveBeenCalledWith('Cache hit for key: test-key');
    });

    it('should return null when cache miss occurs', async () => {
      mockCache.get.mockResolvedValue(null);

      const result = await getCachedData('missing-key', mockEnv);

      expect(result).toBeNull();
      expect(mockCache.get).toHaveBeenCalledWith('missing-key', 'json');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should return null when cache get throws error', async () => {
      const error = new Error('KV namespace error');
      mockCache.get.mockRejectedValue(error);

      const result = await getCachedData('error-key', mockEnv);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Cache get error:', error);
    });

    it('should handle network errors gracefully', async () => {
      mockCache.get.mockRejectedValue(new Error('Network timeout'));

      const result = await getCachedData('network-error-key', mockEnv);

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle undefined value from cache', async () => {
      mockCache.get.mockResolvedValue(undefined);

      const result = await getCachedData('undefined-key', mockEnv);

      expect(result).toBeNull();
    });

    it('should handle empty string from cache', async () => {
      mockCache.get.mockResolvedValue('');

      const result = await getCachedData('empty-string-key', mockEnv);

      expect(result).toBeNull();
    });

    it('should return typed data correctly', async () => {
      interface TestData {
        id: string;
        items: number[];
      }

      const typedData: TestData = {
        id: 'test-id',
        items: [1, 2, 3],
      };

      mockCache.get.mockResolvedValue(typedData);

      const result = await getCachedData<TestData>('typed-key', mockEnv);

      expect(result).toEqual(typedData);
      expect(result?.id).toBe('test-id');
      expect(result?.items).toEqual([1, 2, 3]);
    });
  });

  describe('setCachedData', () => {
    it('should do nothing when CACHE is undefined', async () => {
      const envWithoutCache: Env = {
        YOUTUBE_API_KEY: 'test-key',
        ENVIRONMENT: 'test',
      };

      await setCachedData('test-key', { foo: 'bar' }, envWithoutCache);

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should cache data with default TTL', async () => {
      const data = { foo: 'bar', count: 42 };
      mockCache.put.mockResolvedValue(undefined);

      await setCachedData('test-key', data, mockEnv);

      expect(mockCache.put).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(data),
        { expirationTtl: 3600 } // Default TTL from CACHE_TTL.VIDEO_METADATA
      );
      expect(consoleLogSpy).toHaveBeenCalledWith('Cached data for key: test-key (TTL: 3600s)');
    });

    it('should cache data with custom TTL', async () => {
      const data = { items: [1, 2, 3] };
      const customTtl = 1800;
      mockCache.put.mockResolvedValue(undefined);

      await setCachedData('custom-ttl-key', data, mockEnv, customTtl);

      expect(mockCache.put).toHaveBeenCalledWith('custom-ttl-key', JSON.stringify(data), {
        expirationTtl: customTtl,
      });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'Cached data for key: custom-ttl-key (TTL: 1800s)'
      );
    });

    it('should handle cache put errors gracefully', async () => {
      const error = new Error('KV write failed');
      mockCache.put.mockRejectedValue(error);

      // Should not throw
      await expect(setCachedData('error-key', { foo: 'bar' }, mockEnv)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith('Cache set error:', error);
    });

    it('should serialize complex objects correctly', async () => {
      const complexData = {
        nested: {
          deep: {
            value: 'test',
          },
        },
        array: [1, 2, { inner: true }],
        date: new Date('2024-01-01').toISOString(),
      };

      mockCache.put.mockResolvedValue(undefined);

      await setCachedData('complex-key', complexData, mockEnv, 300);

      expect(mockCache.put).toHaveBeenCalledWith('complex-key', JSON.stringify(complexData), {
        expirationTtl: 300,
      });
    });

    it('should handle string data', async () => {
      const stringData = 'simple-string-value';
      mockCache.put.mockResolvedValue(undefined);

      await setCachedData('string-key', stringData, mockEnv, 600);

      expect(mockCache.put).toHaveBeenCalledWith('string-key', JSON.stringify(stringData), {
        expirationTtl: 600,
      });
    });

    it('should handle array data', async () => {
      const arrayData = ['video1', 'video2', 'video3'];
      mockCache.put.mockResolvedValue(undefined);

      await setCachedData('array-key', arrayData, mockEnv, 900);

      expect(mockCache.put).toHaveBeenCalledWith('array-key', JSON.stringify(arrayData), {
        expirationTtl: 900,
      });
    });

    it('should handle network errors gracefully', async () => {
      mockCache.put.mockRejectedValue(new Error('Network timeout'));

      await expect(
        setCachedData('network-error-key', { foo: 'bar' }, mockEnv)
      ).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle quota exceeded errors gracefully', async () => {
      mockCache.put.mockRejectedValue(new Error('Quota exceeded'));

      await expect(setCachedData('quota-key', { large: 'data' }, mockEnv)).resolves.toBeUndefined();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Cache set error:',
        expect.objectContaining({ message: 'Quota exceeded' })
      );
    });
  });

  describe('cache integration scenarios', () => {
    it('should handle get after set', async () => {
      const testData = { id: 'test', value: 123 };

      // Set data
      mockCache.put.mockResolvedValue(undefined);
      await setCachedData('integration-key', testData, mockEnv, 500);

      // Get data back
      mockCache.get.mockResolvedValue(testData);
      const result = await getCachedData('integration-key', mockEnv);

      expect(result).toEqual(testData);
    });

    it('should handle multiple sequential operations', async () => {
      mockCache.put.mockResolvedValue(undefined);

      await setCachedData('key1', { a: 1 }, mockEnv, 100);
      await setCachedData('key2', { b: 2 }, mockEnv, 200);
      await setCachedData('key3', { c: 3 }, mockEnv, 300);

      expect(mockCache.put).toHaveBeenCalledTimes(3);
      expect(mockCache.put).toHaveBeenNthCalledWith(1, 'key1', JSON.stringify({ a: 1 }), {
        expirationTtl: 100,
      });
      expect(mockCache.put).toHaveBeenNthCalledWith(2, 'key2', JSON.stringify({ b: 2 }), {
        expirationTtl: 200,
      });
      expect(mockCache.put).toHaveBeenNthCalledWith(3, 'key3', JSON.stringify({ c: 3 }), {
        expirationTtl: 300,
      });
    });
  });
});
