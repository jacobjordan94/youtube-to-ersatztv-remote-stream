import { Hono } from 'hono';
import { z } from 'zod';
import { Env } from '../types';
import { parseYouTubeUrl, validateScriptOptions, sanitizeFilename } from '../utils/validators';
import { getVideoMetadata, getPlaylistVideoIds } from '../services/youtube';
import { generateYaml } from '../services/yaml';
import {
  ConvertVideoResponse,
  ConvertPlaylistResponse,
  PlaylistVideo,
} from '@youtube-to-ersatztv/shared';

const convertSchema = z.object({
  url: z.string().url(),
  includeDuration: z.boolean().default(false),
  scriptOptions: z.string().default('--hls-use-mpegts'),
});

const convert = new Hono<{ Bindings: Env }>();

convert.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const parseResult = convertSchema.safeParse(body);

    if (!parseResult.success) {
      return c.json({ error: 'Validation Error', message: parseResult.error.message }, 400);
    }

    const { url, includeDuration, scriptOptions } = parseResult.data;

    const validation = validateScriptOptions(`yt-dlp {VIDEO_URL} ${scriptOptions} -o -`);
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

    const metadata = await getVideoMetadata(parsed.id, c.env);

    const scriptTemplate = `yt-dlp {VIDEO_URL} ${scriptOptions} -o -`;
    const yaml = generateYaml(metadata, {
      includeDuration,
      scriptTemplate,
      videoUrl: url,
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

    const { url, includeDuration, scriptOptions } = parseResult.data;

    const validation = validateScriptOptions(`yt-dlp {VIDEO_URL} ${scriptOptions} -o -`);
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

    const videoIds = await getPlaylistVideoIds(parsed.id, c.env);

    const videos: PlaylistVideo[] = [];
    const scriptTemplate = `yt-dlp {VIDEO_URL} ${scriptOptions} -o -`;

    for (const videoId of videoIds) {
      try {
        const metadata = await getVideoMetadata(videoId, c.env);
        const videoUrl = `https://youtube.com/watch?v=${videoId}`;

        const yaml = generateYaml(metadata, {
          includeDuration,
          scriptTemplate,
          videoUrl,
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
