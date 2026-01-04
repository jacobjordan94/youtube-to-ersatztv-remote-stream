# YouTube to ErsatzTV Remote Stream Converter

![Version](https://img.shields.io/github/package-json/v/jacobjordan94/youtube-to-ersatztv-remote-stream) ![License](https://img.shields.io/github/license/jacobjordan94/youtube-to-ersatztv-remote-stream) ![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen) ![pnpm](https://img.shields.io/badge/pnpm-8.15.1-orange) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue) ![React](https://img.shields.io/badge/React-18.2.0-blue)

Convert YouTube videos and playlists to ErsatzTV-compatible YAML files. Built with React, TypeScript, and deployed on Cloudflare's edge network.

## Features

- YouTube video and playlist conversion with metadata extraction
- Real-time YAML preview with syntax highlighting
- Playlist modes: global settings or per-file customization
- Multiple download formats: single file, ZIP archive, or queue
- 4 duration modes: none, custom, API, or API-padded (rounded intervals)
- 6 filename formats: original, compact, kebab, snake, sequential prefix/suffix
- Optional title and description inclusion with formatting options
- Customizable yt-dlp script options with validation

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, TailwindCSS, shadcn/ui
**Backend:** Hono, Cloudflare Workers, YouTube Data API v3, Zod
**Monorepo:** pnpm workspaces with shared types package

## Prerequisites

- Node.js ≥20.0.0
- pnpm ≥8.0.0
- [YouTube Data API v3 Key](https://console.cloud.google.com/apis/credentials)

## Quick Start

```bash
# Install pnpm
npm install -g pnpm

# Install dependencies
pnpm install

# Configure backend API key
cp packages/backend/.dev.vars.example packages/backend/.dev.vars
# Edit .dev.vars and add YOUTUBE_API_KEY

# Start development servers
pnpm dev
```

Frontend: http://localhost:5173
Backend: http://localhost:8787

## Usage

**Single Video:**
1. Enter YouTube URL
2. Configure duration, filename format, and options
3. Preview and download YAML

**Playlist:**
1. Enter playlist URL
2. Choose global or per-file settings mode
3. Configure each video (per-file mode)
4. Download as current file, ZIP, or queue

## Example Output

```yaml
script: "yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -"
is_live: false
duration: 00:03:33
title: "Video Title"
description: "Video description"
```

## API Endpoints

**POST `/api/convert`** - Convert single video
**POST `/api/convert/playlist`** - Get playlist video IDs
**GET `/health`** - Health check

See full API documentation in the codebase or use the web interface.

## Deployment

```bash
# Backend (Cloudflare Workers)
cd packages/backend
npx wrangler secret put YOUTUBE_API_KEY
pnpm deploy:backend

# Frontend (Cloudflare Pages)
pnpm deploy:frontend
```

Update `packages/frontend/.env` with production API URL.

## Development Commands

```bash
pnpm dev           # Start both frontend and backend
pnpm build         # Build all packages
pnpm type-check    # TypeScript validation
pnpm lint          # Lint code
pnpm format        # Format code
```

## Related Resources

- [ErsatzTV](https://ersatztv.org) - Media server this tool supports
- [ErsatzTV Docs](https://ersatztv.org/docs/) - Official documentation
- [Remote Streams Guide](https://ersatztv.org/docs/media/local/remotestreams/)
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - Download tool used by ErsatzTV

## License

MIT - See [LICENSE](LICENSE) file

## Support

- [ErsatzTV Documentation](https://ersatztv.org/docs/)
- [GitHub Issues](https://github.com/jacobjordan94/youtube-to-ersatztv-remote-stream/issues)
