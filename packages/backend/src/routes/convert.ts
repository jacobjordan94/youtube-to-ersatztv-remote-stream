import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';
import { parseYouTubeUrl, validateScriptOptions, sanitizeFilename } from '../utils/validators';
import {
  validateAndSanitizeYouTubeVideoUrl,
  validateAndSanitizeYouTubePlaylistUrl,
  sanitizeScriptOptions as sanitizeScriptInput,
} from '../utils/validation';
import { getVideoMetadata, getPlaylistVideoIds } from '../services/youtube';
import { generateYaml } from '../services/yaml';
import { cloudflareRateLimit } from '../middleware/rateLimit';
import {
  ConvertVideoResponse,
  ConvertPlaylistResponse,
  PlaylistVideo,
} from '@youtube-to-ersatztv/shared';

const convertSchema = z.object({
  url: z.string().url(),
  durationMode: z.enum(['none', 'custom', 'api', 'api-padded']),
  scriptOptions: z.string().default('--hls-use-mpegts'),
  customDuration: z
    .string()
    .regex(/^([0-9]{2}):([0-5][0-9]):([0-5][0-9])$/, 'Duration must be in HH:MM:SS format (e.g., 01:23:45)')
    .optional(),
  paddingInterval: z
    .number()
    .int()
    .refine((val) => [5, 10, 15, 30].includes(val), 'Padding must be 5, 10, 15, or 30 minutes')
    .optional(),
}).refine(
  (data) => {
    if (data.durationMode === 'custom' && !data.customDuration) {
      return false;
    }
    if (data.durationMode === 'api-padded' && !data.paddingInterval) {
      return false;
    }
    return true;
  },
  { message: 'Missing required field for selected duration mode' }
);

const convert = new Hono<{ Bindings: Env }>();

// Apply rate limiting: 60 requests per minute per IP
convert.use('/*', cloudflareRateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60,
}));

convert.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = convertSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json({ error: 'Validation Error', message: parseResult.error.message }, 400);
    }

    const { url, durationMode, scriptOptions, customDuration, paddingInterval } = parseResult.data;

    // Validate and sanitize URL
    const urlValidation = validateAndSanitizeYouTubeVideoUrl(url);
    if (!urlValidation.valid) {
      return c.json({ error: 'Validation Error', message: urlValidation.error }, 400);
    }

    // Sanitize script options
    const scriptValidation = sanitizeScriptInput(scriptOptions);
    if (!scriptValidation.valid) {
      return c.json({ error: 'Validation Error', message: scriptValidation.error }, 400);
    }

    const sanitizedScriptOptions = scriptValidation.sanitized || scriptOptions;

    // Additional validation for script template
    const validation = validateScriptOptions(`yt-dlp {VIDEO_URL} ${sanitizedScriptOptions} -o -`);
    if (!validation.valid) {
      return c.json({ error: 'Validation Error', message: validation.error }, 400);
    }

    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      return c.json(
        { error: 'Invalid URL', message: 'Please provide a valid YouTube video URL' },
        400
      );
    }

    if (parsed.type !== 'video') {
      return c.json(
        {
          error: 'Invalid URL',
          message: 'This endpoint only accepts video URLs. Use /api/convert/playlist for playlists',
        },
        400
      );
    }

    const metadata = await getVideoMetadata(parsed.id, c.env as Env);

    const scriptTemplate = `yt-dlp {VIDEO_URL} ${sanitizedScriptOptions} -o -`;
    const yaml = generateYaml(metadata, {
      durationMode,
      scriptTemplate,
      videoUrl: url,
      customDuration,
      paddingInterval,
    });

    const response: ConvertVideoResponse = {
      yaml,
      metadata,
    };

    return c.json(response);
  } catch (error) {
    console.error('Convert error:', error);
    return c.json(
      {
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      500
    );
  }
});

convert.post('/playlist', async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = convertSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json({ error: 'Validation Error', message: parseResult.error.message }, 400);
    }

    const { url, durationMode, scriptOptions, customDuration, paddingInterval } = parseResult.data;

    // Validate and sanitize URL
    const urlValidation = validateAndSanitizeYouTubePlaylistUrl(url);
    if (!urlValidation.valid) {
      return c.json({ error: 'Validation Error', message: urlValidation.error }, 400);
    }

    // Sanitize script options
    const scriptValidation = sanitizeScriptInput(scriptOptions);
    if (!scriptValidation.valid) {
      return c.json({ error: 'Validation Error', message: scriptValidation.error }, 400);
    }

    const sanitizedScriptOptions = scriptValidation.sanitized || scriptOptions;

    // Additional validation for script template
    const validation = validateScriptOptions(`yt-dlp {VIDEO_URL} ${sanitizedScriptOptions} -o -`);
    if (!validation.valid) {
      return c.json({ error: 'Validation Error', message: validation.error }, 400);
    }

    const parsed = parseYouTubeUrl(url);
    if (!parsed) {
      return c.json(
        { error: 'Invalid URL', message: 'Please provide a valid YouTube playlist URL' },
        400
      );
    }

    if (parsed.type !== 'playlist') {
      return c.json(
        {
          error: 'Invalid URL',
          message: 'This endpoint only accepts playlist URLs. Use /api/convert for single videos',
        },
        400
      );
    }

    const videoIds = await getPlaylistVideoIds(parsed.id, c.env as Env);

    const videos: PlaylistVideo[] = [];
    const scriptTemplate = `yt-dlp {VIDEO_URL} ${sanitizedScriptOptions} -o -`;

    for (const videoId of videoIds) {
      try {
        const metadata = await getVideoMetadata(videoId, c.env as Env);
        const videoUrl = `https://youtube.com/watch?v=${videoId}`;

        const yaml = generateYaml(metadata, {
          durationMode,
          scriptTemplate,
          videoUrl,
          customDuration,
          paddingInterval,
        });

        videos.push({
          yaml,
          filename: `${sanitizeFilename(metadata.title)}.yml`,
          metadata,
        });
      } catch (error) {
        console.error(`Failed to process video ${videoId}:`, error);
      }
    }

    const response: ConvertPlaylistResponse = {
      videos,
    };

    return c.json(response);
  } catch (error) {
    console.error('Convert playlist error:', error);
    return c.json(
      {
        error: 'Server Error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      500
    );
  }
});

export default convert;
