import type { FilenameFormat } from '@/types/config';

/**
 * Removes OS-invalid filename characters: / \ : * ? " < > |
 */
function removeInvalidChars(title: string): string {
  return title.replace(/[/\\:*?"<>|]/g, '');
}

/**
 * Formats a filename according to specified format
 * @param title - The video title to format
 * @param format - The desired filename format
 * @param index - Optional index for sequential formats
 * @param maxLength - Maximum length of the formatted filename (default: 200)
 * @returns A formatted filename-safe string
 */
export function formatFilename(
  title: string,
  format: FilenameFormat,
  index?: number,
  maxLength: number = 200
): string {
  let formatted: string;

  switch (format) {
    case 'original':
      // Keep spaces, casing, punctuation - only remove invalid chars
      formatted = removeInvalidChars(title).trim();
      break;

    case 'compact':
      // Current implementation
      formatted = title
        .replace(/[^a-z0-9\s-]/gi, '')
        .replace(/\s+/g, '-')
        .toLowerCase();
      break;

    case 'kebab':
      // Preserve casing, replace spaces with hyphens
      formatted = removeInvalidChars(title).replace(/\s+/g, '-').replace(/-+/g, '-'); // Remove consecutive hyphens
      break;

    case 'snake':
      // Lowercase with underscores
      formatted = title
        .replace(/[^a-z0-9\s_]/gi, '')
        .replace(/\s+/g, '_')
        .toLowerCase();
      break;

    case 'sequential-prefix':
      if (index === undefined) throw new Error('Index required for sequential format');
      const prefixBase = formatFilename(title, 'compact', undefined, maxLength - 4);
      return `${String(index + 1).padStart(3, '0')}-${prefixBase}`;

    case 'sequential-suffix':
      if (index === undefined) throw new Error('Index required for sequential format');
      const suffixBase = formatFilename(title, 'compact', undefined, maxLength - 4);
      return `${suffixBase}-${String(index + 1).padStart(3, '0')}`;
  }

  return formatted.substring(0, maxLength);
}

/**
 * Sanitizes a video title for use as a filename
 * @param title - The video title to sanitize
 * @param maxLength - Maximum length of the sanitized filename (default: 200)
 * @returns A sanitized filename-safe string
 * @deprecated Use formatFilename with 'compact' format instead
 */
export function sanitizeFilename(title: string, maxLength: number = 200): string {
  return formatFilename(title, 'compact', undefined, maxLength);
}

/**
 * Creates a numbered filename for a playlist video
 * @param title - The video title
 * @param index - The 0-based index of the video in the playlist
 * @param format - The desired filename format (default: 'sequential-prefix')
 * @param maxLength - Maximum length of the sanitized title portion (default: 200)
 * @returns A formatted filename
 */
export function createPlaylistFilename(
  title: string,
  index: number,
  format: FilenameFormat = 'sequential-prefix',
  maxLength: number = 200
): string {
  return formatFilename(title, format, index, maxLength);
}
