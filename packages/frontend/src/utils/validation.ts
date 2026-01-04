/**
 * YouTube URL validation utilities
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a YouTube video URL
 * Supports formats:
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function validateYouTubeVideoUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Check if it's a valid URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Check protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  // YouTube domain variants
  const validDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be'];

  if (!validDomains.includes(hostname)) {
    return { valid: false, error: 'URL must be from YouTube' };
  }

  // youtu.be short format
  if (hostname === 'youtu.be') {
    const videoId = pathname.slice(1); // Remove leading slash
    if (!videoId || !/^[a-zA-Z0-9_-]{10,12}$/.test(videoId)) {
      return { valid: false, error: 'Invalid YouTube video ID' };
    }
    return { valid: true };
  }

  // Standard YouTube format
  if (pathname === '/watch') {
    const videoId = parsedUrl.searchParams.get('v');
    if (!videoId || !/^[a-zA-Z0-9_-]{10,12}$/.test(videoId)) {
      return { valid: false, error: 'Invalid or missing video ID parameter' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'URL must be a YouTube video URL' };
}

/**
 * Validates a YouTube playlist URL
 * Supports formats:
 * - https://youtube.com/playlist?list=PLAYLIST_ID
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 */
export function validateYouTubePlaylistUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Check if it's a valid URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmedUrl);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Check protocol
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    return { valid: false, error: 'URL must use HTTP or HTTPS protocol' };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  // YouTube domain variants
  const validDomains = ['youtube.com', 'www.youtube.com', 'm.youtube.com'];

  if (!validDomains.includes(hostname)) {
    return { valid: false, error: 'URL must be from YouTube' };
  }

  if (pathname !== '/playlist') {
    return { valid: false, error: 'URL must be a YouTube playlist URL' };
  }

  const playlistId = parsedUrl.searchParams.get('list');
  if (!playlistId || !/^[a-zA-Z0-9_-]+$/.test(playlistId)) {
    return { valid: false, error: 'Invalid or missing playlist ID parameter' };
  }

  return { valid: true };
}

/**
 * Sanitizes script options to prevent command injection
 * Removes dangerous characters and patterns
 */
export function sanitizeScriptOptions(options: string): string {
  if (!options || typeof options !== 'string') {
    return '';
  }

  // Remove null bytes
  let sanitized = options.replace(/\0/g, '');

  // Remove shell metacharacters that could be used for command injection
  // Keep only: alphanumeric, spaces, hyphens, underscores, forward slashes, curly braces, dots
  sanitized = sanitized.replace(/[^\w\s\-_./{}\[\]]/g, '');

  return sanitized.trim();
}

/**
 * Validates duration format (HH:MM:SS)
 */
export function validateDuration(duration: string): ValidationResult {
  if (!duration || typeof duration !== 'string') {
    return { valid: false, error: 'Duration is required' };
  }

  const trimmedDuration = duration.trim();

  if (!trimmedDuration) {
    return { valid: false, error: 'Duration cannot be empty' };
  }

  // Match HH:MM:SS format
  const durationRegex = /^(\d{2}):([0-5]\d):([0-5]\d)$/;
  const match = trimmedDuration.match(durationRegex);

  if (!match) {
    return { valid: false, error: 'Duration must be in HH:MM:SS format' };
  }

  const hours = parseInt(match[1], 10);
  if (hours > 23) {
    return { valid: false, error: 'Hours must be between 00 and 23' };
  }

  return { valid: true };
}
