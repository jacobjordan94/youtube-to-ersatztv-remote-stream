import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadAsZip, downloadAsQueue, downloadCurrent } from '../../utils/download-playlist';
import * as downloadModule from '../../utils/download';
import JSZip from 'jszip';
import type { PlaylistVideo } from '@youtube-to-ersatztv/shared';

// Mock JSZip
vi.mock('jszip');

// Mock download module
vi.mock('../../utils/download', () => ({
  downloadFile: vi.fn(),
}));

describe('Download Playlist Utilities', () => {
  let mockCreateElement: any;
  let mockAppendChild: any;
  let mockRemoveChild: any;
  let mockClick: any;
  let mockCreateObjectURL: any;
  let mockRevokeObjectURL: any;

  beforeEach(() => {
    // Add URL methods to globalThis if they don't exist (jsdom doesn't have them)
    if (!globalThis.URL.createObjectURL) {
      globalThis.URL.createObjectURL = vi.fn();
    }
    if (!globalThis.URL.revokeObjectURL) {
      globalThis.URL.revokeObjectURL = vi.fn();
    }

    // Mock DOM methods
    mockClick = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();

    mockCreateElement = vi.spyOn(document, 'createElement').mockReturnValue({
      click: mockClick,
      href: '',
      download: '',
    } as any);

    mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as any);
    mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as any);

    mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
    mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadAsZip', () => {
    it('should create ZIP with all video files', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: '001-video-1.yaml',
          yaml: 'content: video1',
          metadata: {
            title: 'Video 1',
            description: '',
            duration: '00:05:00',
            isLive: false,
            videoId: 'abc123',
          },
        },
        {
          filename: '002-video-2.yaml',
          yaml: 'content: video2',
          metadata: {
            title: 'Video 2',
            description: '',
            duration: '00:10:00',
            isLive: false,
            videoId: 'def456',
          },
        },
      ];

      const mockZipInstance = {
        file: vi.fn(),
        generateAsync: vi.fn().mockResolvedValue(new Blob(['mock-zip-content'])),
      };

      vi.mocked(JSZip).mockImplementation(() => mockZipInstance as any);

      await downloadAsZip(mockVideos);

      // Verify files were added to ZIP
      expect(mockZipInstance.file).toHaveBeenCalledTimes(2);
      expect(mockZipInstance.file).toHaveBeenCalledWith('001-video-1.yaml', 'content: video1');
      expect(mockZipInstance.file).toHaveBeenCalledWith('002-video-2.yaml', 'content: video2');

      // Verify ZIP generation
      expect(mockZipInstance.generateAsync).toHaveBeenCalledWith({ type: 'blob' });
    });

    it('should trigger download with correct filename', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: 'test.yaml',
          yaml: 'test: content',
          metadata: {
            title: 'Test Video',
            description: '',
            duration: '00:03:00',
            isLive: false,
            videoId: 'test123',
          },
        },
      ];

      const mockBlob = new Blob(['zip-content']);
      const mockZipInstance = {
        file: vi.fn(),
        generateAsync: vi.fn().mockResolvedValue(mockBlob),
      };

      vi.mocked(JSZip).mockImplementation(() => mockZipInstance as any);

      await downloadAsZip(mockVideos);

      // Verify download link was created
      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);

      // Verify link properties
      const linkElement = mockCreateElement.mock.results[0].value;
      expect(linkElement.href).toBe('blob:mock-url');
      expect(linkElement.download).toBe('playlist-yamls.zip');

      // Verify DOM manipulation
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should handle empty playlist', async () => {
      const mockVideos: PlaylistVideo[] = [];

      const mockZipInstance = {
        file: vi.fn(),
        generateAsync: vi.fn().mockResolvedValue(new Blob([])),
      };

      vi.mocked(JSZip).mockImplementation(() => mockZipInstance as any);

      await downloadAsZip(mockVideos);

      expect(mockZipInstance.file).not.toHaveBeenCalled();
      expect(mockZipInstance.generateAsync).toHaveBeenCalled();
    });

    it('should handle special characters in filenames', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: 'video-with-quotes-special-chars.yaml',
          yaml: 'content: test',
          metadata: {
            title: 'Video with "quotes" & special chars!',
            description: '',
            duration: '00:05:00',
            isLive: false,
            videoId: 'special123',
          },
        },
      ];

      const mockZipInstance = {
        file: vi.fn(),
        generateAsync: vi.fn().mockResolvedValue(new Blob([])),
      };

      vi.mocked(JSZip).mockImplementation(() => mockZipInstance as any);

      await downloadAsZip(mockVideos);

      expect(mockZipInstance.file).toHaveBeenCalledWith(
        'video-with-quotes-special-chars.yaml',
        'content: test'
      );
    });

    it('should clean up resources after download', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: 'test.yaml',
          yaml: 'content',
          metadata: {
            title: 'Test',
            description: '',
            duration: '00:01:00',
            isLive: false,
            videoId: 'test',
          },
        },
      ];

      const mockZipInstance = {
        file: vi.fn(),
        generateAsync: vi.fn().mockResolvedValue(new Blob([])),
      };

      vi.mocked(JSZip).mockImplementation(() => mockZipInstance as any);

      await downloadAsZip(mockVideos);

      const linkElement = mockCreateElement.mock.results[0].value;

      // Verify cleanup order
      expect(mockAppendChild).toHaveBeenCalledWith(linkElement);
      expect(mockClick).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(linkElement);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });

  describe('downloadAsQueue', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should download videos sequentially with delay', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: 'video-1.yaml',
          yaml: 'content1',
          metadata: {
            title: 'Video 1',
            description: '',
            duration: '00:05:00',
            isLive: false,
            videoId: 'vid1',
          },
        },
        {
          filename: 'video-2.yaml',
          yaml: 'content2',
          metadata: {
            title: 'Video 2',
            description: '',
            duration: '00:10:00',
            isLive: false,
            videoId: 'vid2',
          },
        },
        {
          filename: 'video-3.yaml',
          yaml: 'content3',
          metadata: {
            title: 'Video 3',
            description: '',
            duration: '00:15:00',
            isLive: false,
            videoId: 'vid3',
          },
        },
      ];

      const downloadPromise = downloadAsQueue(mockVideos);

      // Run all timers to completion
      await vi.runAllTimersAsync();
      await downloadPromise;

      // Verify all videos were downloaded
      expect(downloadModule.downloadFile).toHaveBeenCalledTimes(3);
      expect(downloadModule.downloadFile).toHaveBeenNthCalledWith(1, 'content1', 'video-1.yaml');
      expect(downloadModule.downloadFile).toHaveBeenNthCalledWith(2, 'content2', 'video-2.yaml');
      expect(downloadModule.downloadFile).toHaveBeenNthCalledWith(3, 'content3', 'video-3.yaml');
    });

    it('should handle single video without delay', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: 'single.yaml',
          yaml: 'content',
          metadata: {
            title: 'Single Video',
            description: '',
            duration: '00:05:00',
            isLive: false,
            videoId: 'single',
          },
        },
      ];

      const downloadPromise = downloadAsQueue(mockVideos);
      await vi.runAllTimersAsync();
      await downloadPromise;

      expect(downloadModule.downloadFile).toHaveBeenCalledTimes(1);
      expect(downloadModule.downloadFile).toHaveBeenCalledWith('content', 'single.yaml');
    });

    it('should handle empty playlist', async () => {
      const mockVideos: PlaylistVideo[] = [];

      await downloadAsQueue(mockVideos);

      expect(downloadModule.downloadFile).not.toHaveBeenCalled();
    });

    it('should maintain 300ms delay between downloads', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: 'v1.yaml',
          yaml: 'c1',
          metadata: {
            title: 'Video 1',
            description: '',
            duration: '00:01:00',
            isLive: false,
            videoId: 'v1',
          },
        },
        {
          filename: 'v2.yaml',
          yaml: 'c2',
          metadata: {
            title: 'Video 2',
            description: '',
            duration: '00:02:00',
            isLive: false,
            videoId: 'v2',
          },
        },
      ];

      const downloadPromise = downloadAsQueue(mockVideos);
      await vi.runAllTimersAsync();
      await downloadPromise;

      // Verify both downloads happened in order
      expect(downloadModule.downloadFile).toHaveBeenCalledTimes(2);
      expect(downloadModule.downloadFile).toHaveBeenNthCalledWith(1, 'c1', 'v1.yaml');
      expect(downloadModule.downloadFile).toHaveBeenNthCalledWith(2, 'c2', 'v2.yaml');
    });

    it('should preserve filename formatting', async () => {
      const mockVideos: PlaylistVideo[] = [
        {
          filename: '001-test-video-with-long-name.yaml',
          yaml: 'yaml: content',
          metadata: {
            title: 'Test Video',
            description: '',
            duration: '00:05:00',
            isLive: false,
            videoId: 'test',
          },
        },
      ];

      const downloadPromise = downloadAsQueue(mockVideos);
      await vi.runAllTimersAsync();
      await downloadPromise;

      expect(downloadModule.downloadFile).toHaveBeenCalledWith(
        'yaml: content',
        '001-test-video-with-long-name.yaml'
      );
    });
  });

  describe('downloadCurrent', () => {
    it('should download single video immediately', () => {
      const mockVideo: PlaylistVideo = {
        filename: 'current-video.yaml',
        yaml: 'yaml: current',
        metadata: {
          title: 'Current Video',
          description: '',
          duration: '00:05:00',
          isLive: false,
          videoId: 'current123',
        },
      };

      downloadCurrent(mockVideo);

      expect(downloadModule.downloadFile).toHaveBeenCalledTimes(1);
      expect(downloadModule.downloadFile).toHaveBeenCalledWith(
        'yaml: current',
        'current-video.yaml'
      );
    });

    it('should use pre-formatted filename', () => {
      const mockVideo: PlaylistVideo = {
        filename: '005-episode-5-the-big-reveal.yaml',
        yaml: 'content: episode',
        metadata: {
          title: 'Episode 5: The Big Reveal!',
          description: '',
          duration: '00:25:00',
          isLive: false,
          videoId: 'ep5',
        },
      };

      downloadCurrent(mockVideo);

      expect(downloadModule.downloadFile).toHaveBeenCalledWith(
        'content: episode',
        '005-episode-5-the-big-reveal.yaml'
      );
    });

    it('should handle livestream video', () => {
      const mockVideo: PlaylistVideo = {
        filename: 'livestream.yaml',
        yaml: 'isLive: true',
        metadata: {
          title: 'Livestream',
          description: '',
          duration: '00:00:00',
          isLive: true,
          videoId: 'live123',
        },
      };

      downloadCurrent(mockVideo);

      expect(downloadModule.downloadFile).toHaveBeenCalledWith(
        'isLive: true',
        'livestream.yaml'
      );
    });

    it('should handle video with special characters in YAML', () => {
      const mockVideo: PlaylistVideo = {
        filename: 'special.yaml',
        yaml: 'title: "Video with \\"quotes\\" & special chars"\ndescription: |  \n  Multi-line\n  content',
        metadata: {
          title: 'Special Content',
          description: '',
          duration: '00:08:00',
          isLive: false,
          videoId: 'special',
        },
      };

      downloadCurrent(mockVideo);

      expect(downloadModule.downloadFile).toHaveBeenCalledWith(
        mockVideo.yaml,
        'special.yaml'
      );
    });
  });
});
