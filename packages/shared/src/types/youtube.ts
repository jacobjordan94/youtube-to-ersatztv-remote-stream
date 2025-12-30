export interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
  };
  contentDetails: {
    duration: string;
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
  };
}

export interface YouTubeApiResponse {
  items: YouTubeVideoDetails[];
}

export interface YouTubePlaylistItem {
  snippet: {
    resourceId: {
      videoId: string;
    };
  };
}

export interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
}
