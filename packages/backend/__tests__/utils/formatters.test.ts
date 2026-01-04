import { describe, it, expect } from 'vitest';
import { convertIso8601ToDuration, padDurationToInterval } from '../../src/utils/formatters';

describe('convertIso8601ToDuration', () => {
  describe('standard formats', () => {
    it('should convert hours, minutes, and seconds', () => {
      expect(convertIso8601ToDuration('PT1H2M3S')).toBe('01:02:03');
    });

    it('should convert hours and minutes only', () => {
      expect(convertIso8601ToDuration('PT1H30M')).toBe('01:30:00');
    });

    it('should convert minutes and seconds only', () => {
      expect(convertIso8601ToDuration('PT15M45S')).toBe('00:15:45');
    });

    it('should convert hours only', () => {
      expect(convertIso8601ToDuration('PT2H')).toBe('02:00:00');
    });

    it('should convert minutes only', () => {
      expect(convertIso8601ToDuration('PT30M')).toBe('00:30:00');
    });

    it('should convert seconds only', () => {
      expect(convertIso8601ToDuration('PT45S')).toBe('00:00:45');
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration', () => {
      expect(convertIso8601ToDuration('PT0S')).toBe('00:00:00');
    });

    it('should handle single digit values with padding', () => {
      expect(convertIso8601ToDuration('PT1H2M3S')).toBe('01:02:03');
    });

    it('should handle double digit values', () => {
      expect(convertIso8601ToDuration('PT12H34M56S')).toBe('12:34:56');
    });

    it('should handle large hour values', () => {
      expect(convertIso8601ToDuration('PT100H0M0S')).toBe('100:00:00');
    });

    it('should return 00:00:00 for invalid format', () => {
      expect(convertIso8601ToDuration('invalid')).toBe('00:00:00');
    });

    it('should return 00:00:00 for empty string', () => {
      expect(convertIso8601ToDuration('')).toBe('00:00:00');
    });

    it('should return 00:00:00 for malformed ISO8601', () => {
      expect(convertIso8601ToDuration('P1D')).toBe('00:00:00');
    });
  });

  describe('real-world examples', () => {
    it('should convert typical short video (3min 33sec)', () => {
      expect(convertIso8601ToDuration('PT3M33S')).toBe('00:03:33');
    });

    it('should convert typical medium video (12min 45sec)', () => {
      expect(convertIso8601ToDuration('PT12M45S')).toBe('00:12:45');
    });

    it('should convert typical long video (1hr 23min 45sec)', () => {
      expect(convertIso8601ToDuration('PT1H23M45S')).toBe('01:23:45');
    });

    it('should convert very long video (2hr 30min)', () => {
      expect(convertIso8601ToDuration('PT2H30M0S')).toBe('02:30:00');
    });
  });
});

describe('padDurationToInterval', () => {
  describe('5 minute intervals', () => {
    it('should pad 00:03:33 to 00:05:00', () => {
      expect(padDurationToInterval('00:03:33', 5)).toBe('00:05:00');
    });

    it('should pad 00:05:00 to 00:05:00 (exact match)', () => {
      expect(padDurationToInterval('00:05:00', 5)).toBe('00:05:00');
    });

    it('should pad 00:05:01 to 00:10:00', () => {
      expect(padDurationToInterval('00:05:01', 5)).toBe('00:10:00');
    });

    it('should pad 00:12:00 to 00:15:00', () => {
      expect(padDurationToInterval('00:12:00', 5)).toBe('00:15:00');
    });

    it('should pad 00:00:01 to 00:05:00 (any seconds round up)', () => {
      expect(padDurationToInterval('00:00:01', 5)).toBe('00:05:00');
    });

    it('should pad 01:03:00 to 01:05:00', () => {
      expect(padDurationToInterval('01:03:00', 5)).toBe('01:05:00');
    });
  });

  describe('10 minute intervals', () => {
    it('should pad 00:03:33 to 00:10:00', () => {
      expect(padDurationToInterval('00:03:33', 10)).toBe('00:10:00');
    });

    it('should pad 00:10:00 to 00:10:00 (exact match)', () => {
      expect(padDurationToInterval('00:10:00', 10)).toBe('00:10:00');
    });

    it('should pad 00:15:30 to 00:20:00', () => {
      expect(padDurationToInterval('00:15:30', 10)).toBe('00:20:00');
    });

    it('should pad 01:05:00 to 01:10:00', () => {
      expect(padDurationToInterval('01:05:00', 10)).toBe('01:10:00');
    });
  });

  describe('15 minute intervals', () => {
    it('should pad 00:03:33 to 00:15:00', () => {
      expect(padDurationToInterval('00:03:33', 15)).toBe('00:15:00');
    });

    it('should pad 00:15:00 to 00:15:00 (exact match)', () => {
      expect(padDurationToInterval('00:15:00', 15)).toBe('00:15:00');
    });

    it('should pad 00:20:00 to 00:30:00', () => {
      expect(padDurationToInterval('00:20:00', 15)).toBe('00:30:00');
    });

    it('should pad 01:23:45 to 01:30:00', () => {
      expect(padDurationToInterval('01:23:45', 15)).toBe('01:30:00');
    });
  });

  describe('30 minute intervals', () => {
    it('should pad 00:03:33 to 00:30:00', () => {
      expect(padDurationToInterval('00:03:33', 30)).toBe('00:30:00');
    });

    it('should pad 00:30:00 to 00:30:00 (exact match)', () => {
      expect(padDurationToInterval('00:30:00', 30)).toBe('00:30:00');
    });

    it('should pad 00:45:00 to 01:00:00', () => {
      expect(padDurationToInterval('00:45:00', 30)).toBe('01:00:00');
    });

    it('should pad 01:15:00 to 01:30:00', () => {
      expect(padDurationToInterval('01:15:00', 30)).toBe('01:30:00');
    });

    it('should pad 02:29:59 to 02:30:00', () => {
      expect(padDurationToInterval('02:29:59', 30)).toBe('02:30:00');
    });
  });

  describe('edge cases', () => {
    it('should handle zero duration with 5min interval', () => {
      expect(padDurationToInterval('00:00:00', 5)).toBe('00:00:00');
    });

    it('should round up any non-zero seconds', () => {
      expect(padDurationToInterval('00:04:01', 5)).toBe('00:05:00');
    });

    it('should handle hours crossing boundary', () => {
      expect(padDurationToInterval('00:55:00', 10)).toBe('01:00:00');
    });

    it('should handle large hour values', () => {
      expect(padDurationToInterval('10:03:00', 5)).toBe('10:05:00');
    });

    it('should handle exact intervals with no seconds', () => {
      expect(padDurationToInterval('01:30:00', 30)).toBe('01:30:00');
    });
  });

  describe('real-world livestream scenarios', () => {
    it('should pad 1h 23m 45s video to 1h 30m (15min interval)', () => {
      expect(padDurationToInterval('01:23:45', 15)).toBe('01:30:00');
    });

    it('should pad 2h 5m video to 2h 10m (10min interval)', () => {
      expect(padDurationToInterval('02:05:00', 10)).toBe('02:10:00');
    });

    it('should pad 3h 50m video to 4h (30min interval)', () => {
      expect(padDurationToInterval('03:50:00', 30)).toBe('04:00:00');
    });
  });
});
