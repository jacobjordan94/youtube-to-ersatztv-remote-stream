export const DEFAULT_SCRIPT_TEMPLATE = 'yt-dlp {VIDEO_URL} --hls-use-mpegts -o -';

export const YOUTUBE_URL_PATTERNS = {
  VIDEO: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  PLAYLIST: /youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
};

export const CACHE_TTL = {
  VIDEO_METADATA: 3600,
  PLAYLIST_METADATA: 1800,
  LIVE_STATUS: 300,
};

export const YOUTUBE_API = {
  BASE_URL: 'https://www.googleapis.com/youtube/v3',
  MAX_RESULTS_PER_PAGE: 50,
  MAX_VIDEO_IDS_PER_REQUEST: 50,
};

export const VALIDATION = {
  REQUIRED_OUTPUT: '-o -',
  PROHIBITED_FLAGS: [
    '-f',
    '--format',
    '--extract-audio',
    '--recode-video',
    '--merge-output-format',
    '--output',
    '--paths',
  ],
};
