export interface YouTubeVideoDetails {
  id: string;
  snippet: {
    title: string;
    description: string;
  };
  contentDetails: {
    duration: string;
  };
  liveStreamingDetails?: {
    scheduledStartTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
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
