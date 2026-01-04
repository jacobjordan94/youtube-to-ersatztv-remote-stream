import {
  ConvertVideoRequest,
  ConvertVideoResponse,
  ConvertPlaylistRequest,
  ConvertPlaylistResponse,
} from '@youtube-to-ersatztv/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export async function convertVideo(request: ConvertVideoRequest): Promise<ConvertVideoResponse> {
  const response = await fetch(`${API_URL}/api/convert`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();

    // Enhanced error message for rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const message = error.message || 'Rate limit exceeded';

      if (retryAfter) {
        throw new Error(`${message} Please wait ${retryAfter} seconds before trying again.`);
      }

      throw new Error(message);
    }

    throw new Error(error.message || 'Failed to convert video');
  }

  return response.json();
}

export async function convertPlaylist(
  request: ConvertPlaylistRequest
): Promise<ConvertPlaylistResponse> {
  const response = await fetch(`${API_URL}/api/convert/playlist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();

    // Enhanced error message for rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const message = error.message || 'Rate limit exceeded';

      if (retryAfter) {
        throw new Error(`${message} Please wait ${retryAfter} seconds before trying again.`);
      }

      throw new Error(message);
    }

    throw new Error(error.message || 'Failed to convert playlist');
  }

  return response.json();
}
