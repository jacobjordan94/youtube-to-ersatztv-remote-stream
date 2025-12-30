import { YOUTUBE_URL_PATTERNS, VALIDATION } from '@youtube-to-ersatztv/shared';

export interface UrlParseResult {
  type: 'video' | 'playlist';
  id: string;
}

export function parseYouTubeUrl(url: string): UrlParseResult | null {
  const videoMatch = url.match(YOUTUBE_URL_PATTERNS.VIDEO);
  if (videoMatch) {
    return { type: 'video', id: videoMatch[1] };
  }

  const playlistMatch = url.match(YOUTUBE_URL_PATTERNS.PLAYLIST);
  if (playlistMatch) {
    return { type: 'playlist', id: playlistMatch[1] };
  }

  return null;
}

export function validateScriptOptions(scriptOptions: string): { valid: boolean; error?: string } {
  if (!scriptOptions.includes(VALIDATION.REQUIRED_OUTPUT)) {
    return {
      valid: false,
      error: `Script must include "${VALIDATION.REQUIRED_OUTPUT}" for stdout output`,
    };
  }

  for (const flag of VALIDATION.PROHIBITED_FLAGS) {
    if (scriptOptions.includes(flag)) {
      return {
        valid: false,
        error: `Script cannot include prohibited flag: ${flag}`,
      };
    }
  }

  const dangerousPatterns = [/;/, /&&/, /\|\|/, /`/, /\$\(/];
  for (const pattern of dangerousPatterns) {
    if (pattern.test(scriptOptions)) {
      return {
        valid: false,
        error: 'Script contains potentially dangerous command chaining or injection',
      };
    }
  }

  return { valid: true };
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-z0-9\s-]/gi, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
    .substring(0, 200);
}
