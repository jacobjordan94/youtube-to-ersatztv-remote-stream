export interface YamlMetadata {
  title: string;
  description: string;
  duration: string;
  isLive: boolean;
  videoUrl: string;
  publishedAt?: string;
}

export interface YamlConfigSettings {
  durationMode: 'none' | 'custom' | 'api' | 'api-padded';
  customDuration: string;
  paddingInterval: number;
  scriptOptions: string;
  livestreamDuration: string;
  customLivestreamDuration: string;
  includeTitle: boolean;
  includePlot: boolean;
  plotFormat: 'string' | 'folded' | 'literal';
  includeYear: boolean;
  includeContentRating: boolean;
  contentRating: string;
}

// Helper function to escape special characters in YAML quoted strings
export const escapeYamlString = (str: string): string => {
  return str
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape double quotes
    .replace(/\n/g, '\\n') // Escape newlines
    .replace(/\r/g, '\\r') // Escape carriage returns
    .replace(/\t/g, '\\t'); // Escape tabs
};

// Helper function to format plot based on selected format
export const formatPlot = (
  description: string,
  format: 'string' | 'folded' | 'literal'
): string => {
  switch (format) {
    case 'string':
      return `plot: "${escapeYamlString(description)}"`;

    case 'folded': {
      // Folded block scalar - newlines become spaces, blank lines create paragraphs
      const foldedLines = description.split('\n').map((line) => `  ${line}`);
      return `plot: >\n${foldedLines.join('\n')}`;
    }

    case 'literal': {
      // Literal block scalar - preserves exact formatting
      const literalLines = description.split('\n').map((line) => `  ${line}`);
      return `plot: |\n${literalLines.join('\n')}`;
    }
  }
};

// Helper function to extract year from ISO 8601 date string
export const extractYearFromDate = (isoDate?: string): number | undefined => {
  if (!isoDate) return undefined;
  // Extract year directly from the string to avoid timezone issues
  const match = isoDate.match(/^(\d{4})/);
  if (!match) return undefined;
  const year = parseInt(match[1], 10);
  return isNaN(year) ? undefined : year;
};

// Function to generate YAML locally based on current settings
export const generateYaml = (metadata: YamlMetadata, settings: YamlConfigSettings): string => {
  const scriptTemplate = `yt-dlp ${metadata.videoUrl} ${settings.scriptOptions} -o -`;

  let duration: string | undefined;

  if (metadata.isLive) {
    // For live streams, use the livestream duration setting
    duration =
      settings.livestreamDuration === 'custom'
        ? settings.customLivestreamDuration
        : settings.livestreamDuration;
  } else {
    // For VODs, use the VOD duration mode
    switch (settings.durationMode) {
      case 'custom':
        duration = settings.customDuration;
        break;
      case 'api':
        duration = metadata.duration;
        break;
      case 'api-padded': {
        // Calculate padded duration locally
        const [hours, minutes, seconds] = metadata.duration.split(':').map(Number);
        const totalMinutes = hours * 60 + minutes + (seconds > 0 ? 1 : 0);
        const paddedMinutes =
          Math.ceil(totalMinutes / settings.paddingInterval) * settings.paddingInterval;
        const paddedHours = Math.floor(paddedMinutes / 60);
        const paddedMins = paddedMinutes % 60;
        duration = [paddedHours, paddedMins, 0].map((v) => String(v).padStart(2, '0')).join(':');
        break;
      }
      case 'none':
        // No duration for VODs when mode is 'none'
        duration = undefined;
        break;
    }
  }

  // Build YAML
  const lines: string[] = [];
  lines.push(`script: "${scriptTemplate}"`);
  lines.push(`is_live: ${metadata.isLive}`);
  if (duration !== undefined) {
    lines.push(`duration: ${duration}`);
  }

  // Add optional fields based on checkboxes
  if (settings.includeTitle) {
    lines.push(`title: "${escapeYamlString(metadata.title)}"`);
  }

  if (settings.includePlot && metadata.description) {
    lines.push(formatPlot(metadata.description, settings.plotFormat));
  }

  if (settings.includeYear && metadata.publishedAt) {
    const year = extractYearFromDate(metadata.publishedAt);
    if (year) {
      lines.push(`year: ${year}`);
    }
  }

  if (settings.includeContentRating && settings.contentRating.trim()) {
    lines.push(`content_rating: "${escapeYamlString(settings.contentRating)}"`);
  }

  return lines.join('\n');
};
