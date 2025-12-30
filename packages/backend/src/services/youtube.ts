import { Env } from '../types';
import { getCachedData, setCachedData } from './cache';
import { convertIso8601ToDuration } from '../utils/formatters';
import {
  VideoMetadata,
  YouTubeApiResponse,
  YOUTUBE_API,
  CACHE_TTL
} from '@youtube-to-ersatztv/shared';

export async function getVideoMetadata(
  videoId: string,
  env: Env
): Promise<VideoMetadata> {
  const cacheKey = `video:${videoId}`;

  const cached = await getCachedData<VideoMetadata>(cacheKey, env);
  if (cached) {
    return cached;
  }

  const url = new URL(`${YOUTUBE_API.BASE_URL}/videos`);
  url.searchParams.set('id', videoId);
  url.searchParams.set('key', env.YOUTUBE_API_KEY);
  url.searchParams.set('part', 'contentDetails,snippet,liveStreamingDetails');

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
  }

  const data: YouTubeApiResponse = await response.json();

  if (!data.items || data.items.length === 0) {
    throw new Error(`Video not found: ${videoId}`);
  }

  const video = data.items[0];
  const isLive = !!(video.liveStreamingDetails?.actualStartTime ||
                    video.liveStreamingDetails?.scheduledStartTime);

  const metadata: VideoMetadata = {
    title: video.snippet.title,
    duration: convertIso8601ToDuration(video.contentDetails.duration),
    isLive,
    videoId,
  };

  await setCachedData(cacheKey, metadata, env, CACHE_TTL.VIDEO_METADATA);

  return metadata;
}

export async function getPlaylistVideoIds(
  playlistId: string,
  env: Env
): Promise<string[]> {
  const cacheKey = `playlist:${playlistId}`;

  const cached = await getCachedData<string[]>(cacheKey, env);
  if (cached) {
    return cached;
  }

  const videoIds: string[] = [];
  let nextPageToken: string | undefined;

  do {
    const url = new URL(`${YOUTUBE_API.BASE_URL}/playlistItems`);
    url.searchParams.set('playlistId', playlistId);
    url.searchParams.set('key', env.YOUTUBE_API_KEY);
    url.searchParams.set('part', 'snippet');
    url.searchParams.set('maxResults', String(YOUTUBE_API.MAX_RESULTS_PER_PAGE));

    if (nextPageToken) {
      url.searchParams.set('pageToken', nextPageToken);
    }

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      break;
    }

    for (const item of data.items) {
      videoIds.push(item.snippet.resourceId.videoId);
    }

    nextPageToken = data.nextPageToken;
  } while (nextPageToken);

  if (videoIds.length === 0) {
    throw new Error(`Playlist not found or empty: ${playlistId}`);
  }

  await setCachedData(cacheKey, videoIds, env, CACHE_TTL.PLAYLIST_METADATA);

  return videoIds;
}
