import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DurationConfig } from '@/components/DurationConfig';

describe('DurationConfig', () => {
  const mockProps = {
    livestreamDuration: '00:00:00',
    customLivestreamDuration: '00:00:00',
    livestreamDurationError: null,
    onLivestreamDurationChange: vi.fn(),
    onCustomLivestreamDurationChange: vi.fn(),
    onLivestreamDurationError: vi.fn(),
    durationMode: 'none' as const,
    customDuration: '00:00:00',
    paddingInterval: 5,
    durationError: null,
    isPlaylist: false,
    onDurationModeChange: vi.fn(),
    onCustomDurationChange: vi.fn(),
    onPaddingIntervalChange: vi.fn(),
    onDurationError: vi.fn(),
    disabled: false,
  };

  describe('Playlist mode (isLive = null)', () => {
    it('should show both livestream and VOD options', () => {
      render(<DurationConfig {...mockProps} isLive={null} />);

      // Check for livestream options
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();

      // Check for VOD options
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();
    });

    it('should show separator between option groups', () => {
      const { container } = render(<DurationConfig {...mockProps} isLive={null} />);

      // Check for separator element
      const separator = container.querySelector('[data-orientation="vertical"]');
      expect(separator).toBeInTheDocument();
    });
  });

  describe('Active livestream mode (isLive = true)', () => {
    it('should show only livestream options', () => {
      render(<DurationConfig {...mockProps} isLive={true} />);

      // Livestream options should be visible
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();

      // VOD options should NOT be visible
      expect(screen.queryByText('VOD Duration')).not.toBeInTheDocument();
    });

    it('should not show separator', () => {
      const { container } = render(<DurationConfig {...mockProps} isLive={true} />);

      // Separator should not exist when only one group is shown
      const separator = container.querySelector('[data-orientation="vertical"]');
      expect(separator).not.toBeInTheDocument();
    });
  });

  describe('VOD mode (isLive = false)', () => {
    it('should show only VOD options', () => {
      render(<DurationConfig {...mockProps} isLive={false} />);

      // VOD options should be visible
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();

      // Livestream options should NOT be visible
      expect(screen.queryByText('Livestream Duration')).not.toBeInTheDocument();
    });

    it('should not show separator', () => {
      const { container } = render(<DurationConfig {...mockProps} isLive={false} />);

      // Separator should not exist when only one group is shown
      const separator = container.querySelector('[data-orientation="vertical"]');
      expect(separator).not.toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('should handle disabled state in playlist mode', () => {
      render(<DurationConfig {...mockProps} isLive={null} disabled={true} />);

      // Both option groups should still be visible
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();
    });

    it('should handle disabled state in livestream mode', () => {
      render(<DurationConfig {...mockProps} isLive={true} disabled={true} />);

      // Only livestream options should be visible
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();
      expect(screen.queryByText('VOD Duration')).not.toBeInTheDocument();
    });

    it('should handle disabled state in VOD mode', () => {
      render(<DurationConfig {...mockProps} isLive={false} disabled={true} />);

      // Only VOD options should be visible
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();
      expect(screen.queryByText('Livestream Duration')).not.toBeInTheDocument();
    });
  });

  describe('Content type transitions', () => {
    it('should properly switch from playlist to livestream mode', () => {
      const { rerender } = render(<DurationConfig {...mockProps} isLive={null} />);

      // Initially both visible
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();

      // Switch to livestream mode
      rerender(<DurationConfig {...mockProps} isLive={true} />);

      // Now only livestream visible
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();
      expect(screen.queryByText('VOD Duration')).not.toBeInTheDocument();
    });

    it('should properly switch from playlist to VOD mode', () => {
      const { rerender } = render(<DurationConfig {...mockProps} isLive={null} />);

      // Initially both visible
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();

      // Switch to VOD mode
      rerender(<DurationConfig {...mockProps} isLive={false} />);

      // Now only VOD visible
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();
      expect(screen.queryByText('Livestream Duration')).not.toBeInTheDocument();
    });

    it('should properly switch from livestream to VOD mode', () => {
      const { rerender } = render(<DurationConfig {...mockProps} isLive={true} />);

      // Initially only livestream
      expect(screen.getByText('Livestream Duration')).toBeInTheDocument();
      expect(screen.queryByText('VOD Duration')).not.toBeInTheDocument();

      // Switch to VOD mode
      rerender(<DurationConfig {...mockProps} isLive={false} />);

      // Now only VOD visible
      expect(screen.getByText('VOD Duration')).toBeInTheDocument();
      expect(screen.queryByText('Livestream Duration')).not.toBeInTheDocument();
    });
  });
});
