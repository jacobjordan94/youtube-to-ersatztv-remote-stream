/**
 * YouTube URL validation and sanitization utilities for backend
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates and sanitizes a YouTube video URL
 * Supports formats:
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function validateAndSanitizeYouTubeVideoUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Check length to prevent DoS
  if (trimmedUrl.length > 2048) {
    return { valid: false, error: 'URL is too long' };
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

  let videoId: string;

  // youtu.be short format
  if (hostname === 'youtu.be') {
    videoId = pathname.slice(1); // Remove leading slash
    if (!videoId || !/^[a-zA-Z0-9_-]{10,12}$/.test(videoId)) {
      return { valid: false, error: 'Invalid YouTube video ID' };
    }
    // Normalize to standard format
    return {
      valid: true,
      sanitized: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  // Standard YouTube format
  if (pathname === '/watch') {
    videoId = parsedUrl.searchParams.get('v') || '';
    if (!videoId || !/^[a-zA-Z0-9_-]{10,12}$/.test(videoId)) {
      return { valid: false, error: 'Invalid or missing video ID parameter' };
    }
    // Normalize to standard format (remove extra params)
    return {
      valid: true,
      sanitized: `https://www.youtube.com/watch?v=${videoId}`,
    };
  }

  return { valid: false, error: 'URL must be a YouTube video URL' };
}

/**
 * Validates and sanitizes a YouTube playlist URL
 * Supports formats:
 * - https://youtube.com/playlist?list=PLAYLIST_ID
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 */
export function validateAndSanitizeYouTubePlaylistUrl(url: string): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    return { valid: false, error: 'URL cannot be empty' };
  }

  // Check length to prevent DoS
  if (trimmedUrl.length > 2048) {
    return { valid: false, error: 'URL is too long' };
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

  // Normalize to standard format (remove extra params)
  return {
    valid: true,
    sanitized: `https://www.youtube.com/playlist?list=${playlistId}`,
  };
}

/**
 * Sanitizes script options to prevent command injection
 * Removes dangerous characters and validates allowed patterns
 */
export function sanitizeScriptOptions(options: string): ValidationResult {
  if (!options || typeof options !== 'string') {
    return { valid: true, sanitized: '' };
  }

  // Check length to prevent DoS
  if (options.length > 10000) {
    return { valid: false, error: 'Script options are too long' };
  }

  // Remove null bytes
  let sanitized = options.replace(/\0/g, '');

  // Check for dangerous patterns
  const dangerousPatterns = [
    /;\s*rm\s/i,
    /;\s*chmod\s/i,
    /;\s*chown\s/i,
    /;\s*dd\s/i,
    /;\s*mkfs\s/i,
    /&&\s*rm\s/i,
    /\|\s*rm\s/i,
    />\s*\/dev\//i,
    /curl.*\|\s*bash/i,
    /wget.*\|\s*bash/i,
    /eval\s*\(/i,
    /exec\s*\(/i,
    /`.*`/,
    /\$\(.*\)/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sanitized)) {
      return { valid: false, error: 'Script options contain dangerous patterns' };
    }
  }

  // Allow only safe characters for yt-dlp commands
  // Alphanumeric, spaces, hyphens, underscores, forward slashes, curly braces, square brackets, dots, colons
  const safePattern = /^[a-zA-Z0-9\s\-_./{}\[\]:]*$/;
  if (!safePattern.test(sanitized)) {
    return { valid: false, error: 'Script options contain invalid characters' };
  }

  return { valid: true, sanitized: sanitized.trim() };
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

  return { valid: true, sanitized: trimmedDuration };
}
