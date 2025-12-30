# YouTube to ErsatzTV Remote Stream Converter

A web application that converts YouTube URLs into ErsatzTV-compatible remote stream YAML files. Built with a modern monorepo architecture using React, Hono, and Cloudflare Workers.

## Features (MVP - Phase 1)

- ✅ Convert YouTube video URLs to ErsatzTV YAML format
- ✅ Automatic metadata extraction (title, duration, live status)
- ✅ Configurable duration inclusion
- ✅ Customizable yt-dlp script options
- ✅ Real-time YAML preview
- ✅ One-click YAML file download
- ✅ YouTube API integration with caching
- ✅ Edge-deployed backend for global performance

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds
- **TailwindCSS** for styling
- **shadcn/ui** for UI components
- **Cloudflare Pages** for deployment

### Backend
- **Hono** web framework
- **Cloudflare Workers** for serverless compute
- **Cloudflare KV** for caching (optional)
- **YouTube Data API v3** integration

### Monorepo
- **pnpm** workspaces
- **TypeScript** for type safety across packages
- Shared types and utilities package

## Project Structure

```
youtube-to-ersatztv-stream/
├── packages/
│   ├── frontend/          # React application
│   ├── backend/           # Hono API
│   └── shared/            # Shared types and utilities
├── package.json           # Root package.json
├── pnpm-workspace.yaml    # Workspace configuration
└── README.md
```

## Prerequisites

- **Node.js** 20 LTS or higher
- **pnpm** 8.0.0 or higher
- **YouTube Data API v3 Key** (get one from [Google Cloud Console](https://console.cloud.google.com/apis/credentials))

## Installation

1. **Install pnpm** (if not already installed):
   ```bash
   npm install -g pnpm
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure environment variables**:

   **Backend** (`packages/backend/.dev.vars`):
   ```bash
   cp packages/backend/.dev.vars.example packages/backend/.dev.vars
   # Edit .dev.vars and add your YouTube API key
   ```

   **Frontend** (`packages/frontend/.env`):
   ```bash
   # Already created with default values
   VITE_API_URL=http://localhost:8787
   ```

## Development

### Start Both Frontend and Backend

```bash
pnpm dev
```

This will start:
- Frontend at http://localhost:5173
- Backend at http://localhost:8787

### Start Individually

```bash
# Frontend only
pnpm dev:frontend

# Backend only
pnpm dev:backend
```

### Other Commands

```bash
# Build all packages
pnpm build

# Type checking
pnpm type-check

# Lint code
pnpm lint

# Format code
pnpm format
```

## Configuration

### YouTube API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **YouTube Data API v3**
4. Create credentials (API key)
5. Copy the API key to `packages/backend/.dev.vars`:
   ```
   YOUTUBE_API_KEY=your_api_key_here
   ```

### Cloudflare KV Setup (Optional, for Production)

```bash
# Login to Cloudflare
npx wrangler login

# Create KV namespace
cd packages/backend
npx wrangler kv:namespace create CACHE
npx wrangler kv:namespace create CACHE --preview

# Update wrangler.toml with the namespace IDs
```

## Deployment

### Backend Deployment (Cloudflare Workers)

```bash
# Set production secrets
cd packages/backend
npx wrangler secret put YOUTUBE_API_KEY

# Deploy
pnpm deploy:backend
```

### Frontend Deployment (Cloudflare Pages)

```bash
# Build and deploy
pnpm deploy:frontend
```

Or connect your GitHub repository to Cloudflare Pages for automatic deployments.

### Environment Variables for Production

Update `packages/frontend/.env` with your production API URL:
```
VITE_API_URL=https://your-api.workers.dev
```

## Usage

1. Open the application in your browser
2. Enter a YouTube video URL
3. Configure options:
   - Toggle "Always include duration" if needed
   - Customize script options (default: `--hls-use-mpegts`)
4. Click "Convert"
5. Preview the generated YAML
6. Click "Download YAML" to save the file

### Example YAML Output

**VOD Video (duration omitted)**:
```yaml
script: "yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -"
is_live: false
```

**VOD Video (duration included)**:
```yaml
script: "yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -"
is_live: false
duration: 00:03:33
```

**Live Stream**:
```yaml
script: "yt-dlp https://youtube.com/watch?v=jfKfPfyJRdk --hls-use-mpegts -o -"
is_live: true
duration: 02:00:00
```

## API Endpoints

### POST `/api/convert`
Convert a single YouTube video URL to YAML.

**Request**:
```json
{
  "url": "https://youtube.com/watch?v=VIDEO_ID",
  "includeDuration": false,
  "scriptOptions": "--hls-use-mpegts"
}
```

**Response**:
```json
{
  "yaml": "script: \"...\"\nis_live: false",
  "metadata": {
    "title": "Video Title",
    "duration": "00:03:33",
    "isLive": false,
    "videoId": "VIDEO_ID"
  }
}
```

### GET `/health`
Health check endpoint.

## Troubleshooting

### "YouTube API error: 403"
- Check that your API key is correct
- Verify that YouTube Data API v3 is enabled in Google Cloud Console
- Check API quota limits

### "Failed to convert video"
- Ensure the YouTube URL is valid
- Check that the video is not private or deleted
- Verify backend is running and accessible

### TypeScript errors
```bash
pnpm type-check
```

### Cache issues
Clear Cloudflare KV cache or restart local dev server.

## Future Enhancements (Planned)

### Phase 2
- Playlist support
- ZIP archive downloads
- Enhanced YAML preview with syntax highlighting

### Phase 3
- Advanced script validation
- Batch processing optimization
- User preferences storage

## Contributing

This is currently a solo project. If you'd like to contribute, please open an issue first to discuss proposed changes.

## License

MIT License - See LICENSE file for details

## Related Projects

- [ErsatzTV](https://ersatztv.org) - The media server this tool is designed for
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The download tool used by ErsatzTV

## Support

For issues and questions:
- Check the [ErsatzTV Documentation](https://ersatztv.org/docs/)
- Review [Remote Stream Samples](https://ersatztv.org/docs/media/local/remotestreams/sample)
- Open an issue on GitHub

---

**Built with ❤️ for the ErsatzTV community**
