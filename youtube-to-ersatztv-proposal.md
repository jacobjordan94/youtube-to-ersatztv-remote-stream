# YouTube to ErsatzTV Remote Stream Converter
## Software Project Proposal

**Version:** 1.0  
**Date:** December 29, 2025  
**Project Type:** Web Application (Monorepo)  

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technical Architecture](#technical-architecture)
4. [Feature Specifications](#feature-specifications)
5. [Tech Stack Details](#tech-stack-details)
6. [Monorepo Structure](#monorepo-structure)
7. [Development Workflow](#development-workflow)
8. [Deployment Strategy](#deployment-strategy)
9. [Implementation Phases](#implementation-phases)
10. [Technical Requirements](#technical-requirements)
11. [Security Considerations](#security-considerations)
12. [Performance Considerations](#performance-considerations)
13. [Future Enhancements](#future-enhancements)
14. [Success Metrics](#success-metrics)
15. [Timeline](#timeline)

---

## Executive Summary

This proposal outlines a web-based application that converts YouTube URLs into ErsatzTV-compatible remote stream YAML files. The system will provide a simple interface for users to input YouTube video or playlist URLs and generate properly formatted configuration files for use with ErsatzTV's remote stream functionality.

The application will be built as a monorepo using modern web technologies and deployed on Cloudflare's edge network for optimal performance and global availability.

---

## Project Overview

### Purpose
To simplify the process of creating ErsatzTV remote stream definitions from YouTube content by automating YAML file generation with proper metadata and yt-dlp configuration.

### Target Users
- ErsatzTV users who want to integrate YouTube content into their streaming setup
- Media enthusiasts managing personal streaming libraries
- Users seeking to automate remote stream configuration

### Key Value Propositions
- Eliminates manual YAML file creation
- Reduces configuration errors
- Supports both single videos and playlists
- Provides live preview and validation
- Offers flexible download options

---

## Technical Architecture

### System Components

#### Frontend (Client)
- **Framework**: React 18+ with Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Deployment**: Cloudflare Pages
- **Features**: Real-time preview, client-side YAML generation, file downloads

#### Backend (Server)
- **Framework**: Hono (edge-optimized)
- **Runtime**: Cloudflare Workers
- **Caching**: Cloudflare KV
- **APIs**: YouTube Data API v3 integration

#### Shared Package
- **Purpose**: Common TypeScript types and utilities
- **Benefit**: Type safety across frontend and backend

---

## Feature Specifications

### 1. User Interface

#### Input Section
- **URL Input Field**:
  - Accepts individual YouTube video URLs
  - Accepts YouTube playlist URLs
  - Real-time URL validation (client-side format check)
  - Loading indicator during processing
  - Clear/reset button

#### Configuration Options
- **"Always include duration" Checkbox**:
  - When checked: Includes the `duration` field in generated YAML files even for Remote VOD content (where it would normally be omitted and auto-detected by ErsatzTV)
  - Default state: Unchecked (follows ErsatzTV standard practice)
  - Use case: For users who prefer explicit duration specification or have specific workflow requirements
  - Dynamic preview updates when toggled

- **Script Options Section**:
  - Editable script field with validation
  - Default: `yt-dlp {VIDEO_URL} --hls-use-mpegts -o -`
  - Option toggles for common flags
  - Reset to default button
  - Real-time validation warnings

#### Preview Section
- **Live YAML Preview**:
  - Syntax highlighting for better readability
  - Editable preview with validation
  - Updates dynamically based on configuration changes
  - Error highlighting for invalid YAML
  - Line numbers for reference

#### Download Section
- **Single Video**:
  - Direct YAML file download
  - Filename: `{video-title}.yml` (sanitized)

- **Playlist**:
  - Choice of download format:
    - Individual files (sequential download)
    - ZIP archive (recommended)
  - Format selection dropdown
  - Download button with file count indicator
  - Progress indicator for large playlists

### 2. Backend Processing

#### YouTube API Integration

**Flow**:
```
Input: YouTube URL
Process:
  1. Parse and validate URL format
  2. Extract video/playlist ID
  3. Query YouTube Data API for:
     - Video title
     - Duration (in ISO 8601 format)
     - Live status (is_live)
     - Playlist items (if applicable)
  4. Convert duration from ISO 8601 to HH:MM:SS
  5. Handle API errors gracefully
  6. Cache responses in Cloudflare KV (1 hour TTL)
Output: Metadata object
```

**API Endpoint Structure**:
```typescript
// Single video
POST /api/convert
Body: { 
  url: string, 
  includeDuration: boolean, 
  scriptOptions: string 
}
Response: { 
  yaml: string, 
  metadata: {
    title: string,
    duration: string,
    isLive: boolean,
    videoId: string
  }
}

// Playlist
POST /api/convert/playlist
Body: { 
  url: string, 
  includeDuration: boolean, 
  scriptOptions: string 
}
Response: { 
  videos: [{
    yaml: string,
    filename: string,
    metadata: {...}
  }]
}
```

#### YAML Generation

**Default Script Template**:
```bash
yt-dlp {VIDEO_URL} --hls-use-mpegts -o -
```

**Required Fields** (auto-populated):
- `script`: yt-dlp command with video URL and flags
- `is_live`: Boolean based on YouTube API response

**Conditional Fields**:
- `duration`: 
  - **VOD Content (is_live: false)**: 
    - Omitted by default (ErsatzTV auto-detects)
    - Included if "Always include duration" is checked
    - Format: `HH:MM:SS`
  - **Live Content (is_live: true)**: 
    - Always included (required for live stream buffer/chunk duration)
    - Format: `HH:MM:SS`

### 3. YAML File Structure

Based on ErsatzTV documentation: https://ersatztv.org/docs/media/local/remotestreams/sample

**Three Remote Stream Examples from Documentation**:
1. **Local Camera** - RTSP stream from a local camera
2. **Remote VOD Content** - Video-on-demand content using yt-dlp
3. **Remote Live Content** - Live streaming content using yt-dlp

#### For YouTube VOD (Video on Demand) Content

**Standard (duration omitted - ErsatzTV auto-detects)**:
```yaml
script: "yt-dlp https://youtube.com/watch?v=VIDEO_ID --hls-use-mpegts -o -"
is_live: false
```

**With "Always include duration" checked**:
```yaml
script: "yt-dlp https://youtube.com/watch?v=VIDEO_ID --hls-use-mpegts -o -"
is_live: false
duration: 01:23:45
```

#### For YouTube Live Streams
```yaml
script: "yt-dlp https://youtube.com/watch?v=VIDEO_ID --hls-use-mpegts -o -"
is_live: true
duration: 02:00:00
```

**Note**: For live streams, duration represents the buffer/chunk duration and is always included.

### 4. Script Customization

#### Allowed User Modifications

**Permitted Options**:
- `--hls-use-mpegts` (toggle on/off)
- Format selection flags that don't alter output destination
- Network/connection options:
  - `--retry-sleep`
  - `--socket-timeout`
  - `--fragment-retries`
- Subtitle/metadata options (as long as they don't redirect output):
  - `--write-subs`
  - `--write-auto-subs`
  - `--embed-subs`
- Authentication options:
  - `--username`
  - `--password`
  - `--netrc`

**Prohibited Modifications**:
- Output redirection changes (must maintain `-o -` for stdout)
- Resolution/quality options that alter the stream output:
  - `-f` format selection
  - `--format`
  - Quality filters
- Download location parameters:
  - `-o` (must remain `-o -`)
  - `--output`
  - `--paths`
- Post-processing options that change the output format:
  - `--extract-audio`
  - `--recode-video`
  - `--merge-output-format`

#### Validation Rules
- Server-side parsing of script modifications
- Regex validation to ensure `-o -` remains intact
- Warning messages for potentially problematic options
- Client-side real-time feedback
- Reset to default option available
- Validation error messages with helpful suggestions

**Validation Examples**:
```typescript
// Valid modifications
"yt-dlp {VIDEO_URL} --hls-use-mpegts --retry-sleep 3 -o -"  ✓
"yt-dlp {VIDEO_URL} --socket-timeout 30 -o -"              ✓
"yt-dlp {VIDEO_URL} -o -"                                   ✓

// Invalid modifications
"yt-dlp {VIDEO_URL} --hls-use-mpegts -o output.mp4"        ✗ (changed output)
"yt-dlp {VIDEO_URL} -f best --hls-use-mpegts -o -"         ✗ (format selection)
"yt-dlp {VIDEO_URL} --extract-audio -o -"                  ✗ (post-processing)
```

### 5. Error Handling

#### Client-Side
- **Invalid URL format detection**:
  - Regex validation for YouTube URL patterns
  - Real-time feedback as user types
  - Helpful error messages with examples

- **Empty input validation**:
  - Disabled submit button when input is empty
  - Clear validation state indicators

- **Network error displays**:
  - Timeout handling
  - Retry mechanism with user feedback
  - Offline detection

#### Server-Side
- **YouTube API quota exceeded handling**:
  - Graceful degradation
  - User-friendly error messages
  - Suggested retry timing

- **Invalid/deleted video detection**:
  - 404 handling
  - Clear error messages
  - Partial playlist success (continue processing remaining videos)

- **Private/restricted content notifications**:
  - Age-restricted content detection
  - Private video handling
  - Regional restrictions

- **Rate limiting for API protection**:
  - Request throttling
  - Queue management
  - Fair usage policies

### 6. Archive Creation

**Client-Side ZIP Generation** (Recommended):
- Uses JSZip library
- Generates ZIP files in browser
- No server bandwidth usage
- No file size limitations
- Faster for end users

**Archive Formats**:
- ZIP only (simplified implementation)
- Future consideration: 7Z, RAR if demand exists

**Filename Convention**:
```
Single video: {video-title-sanitized}.yml
Playlist ZIP: {playlist-title-sanitized}-{video-count}-files.zip
  Contents:
    - {video-1-title}.yml
    - {video-2-title}.yml
    - ...
```

---

## Tech Stack Details

### Frontend Stack

#### Core Technologies
- **React 18+**: UI framework
- **Vite**: Build tool and dev server
- **TypeScript**: Type safety

#### Styling & Components
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Accessible component library
  - Input fields
  - Buttons
  - Checkboxes
  - Dropdowns
  - Loading spinners
  - Tooltips

#### State Management
- **Zustand** (optional): Only if state complexity grows
- **React useState/useContext**: Sufficient for MVP
- Decision: Start without Zustand, add if needed

#### Key Libraries
- **js-yaml**: YAML parsing and validation
- **react-syntax-highlighter**: Syntax highlighting for preview
- **JSZip**: Client-side ZIP creation
- **axios** or **fetch**: API communication

#### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Vitest**: Unit testing

### Backend Stack

#### Core Technologies
- **Node.js 20 LTS**: Runtime
- **Hono**: Web framework (edge-optimized)
- **TypeScript**: Type safety

#### Why Hono?
- Designed for edge runtimes (Cloudflare Workers)
- Ultra-lightweight (~12kb)
- Excellent TypeScript support
- Fast cold starts
- Express-like API (easy learning curve)

#### Key Libraries
- **googleapis**: YouTube Data API v3 client
- **hono/cors**: CORS middleware
- **zod**: Schema validation

#### Cloudflare Services
- **Cloudflare Workers**: Serverless compute
- **Cloudflare KV**: Key-value storage for caching
  - Cache YouTube API responses
  - 1-hour TTL
  - Reduces API quota usage

#### Development Tools
- **Wrangler**: Cloudflare CLI
- **Miniflare**: Local Workers development
- **Vitest**: Unit testing

### Shared Package

#### Purpose
- Common TypeScript types
- Shared utilities
- API contract definitions

#### Benefits
- Type safety across frontend and backend
- Single source of truth for data structures
- Easier refactoring

---

## Monorepo Structure

```
youtube-to-ersatztv/
├── packages/
│   ├── frontend/                    # React application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/             # shadcn components
│   │   │   │   ├── UrlInput.tsx
│   │   │   │   ├── YamlPreview.tsx
│   │   │   │   ├── DownloadSection.tsx
│   │   │   │   └── ConfigOptions.tsx
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   └── yaml-generator.ts
│   │   │   ├── utils/
│   │   │   │   ├── validators.ts
│   │   │   │   └── formatters.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   ├── tsconfig.json
│   │   └── wrangler.toml           # Cloudflare Pages config
│   │
│   ├── backend/                     # Hono API
│   │   ├── src/
│   │   │   ├── index.ts            # Main entry point
│   │   │   ├── routes/
│   │   │   │   ├── convert.ts
│   │   │   │   └── health.ts
│   │   │   ├── services/
│   │   │   │   ├── youtube.ts      # YouTube API integration
│   │   │   │   ├── cache.ts        # KV caching
│   │   │   │   └── yaml.ts         # YAML generation
│   │   │   ├── utils/
│   │   │   │   ├── validators.ts
│   │   │   │   └── formatters.ts
│   │   │   └── types/
│   │   │       └── index.ts
│   │   ├── test/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── wrangler.toml           # Cloudflare Workers config
│   │   └── .dev.vars               # Local env vars (gitignored)
│   │
│   └── shared/                      # Shared types/utils
│       ├── src/
│       │   ├── types/
│       │   │   ├── api.ts
│       │   │   ├── yaml.ts
│       │   │   └── youtube.ts
│       │   └── utils/
│       │       └── constants.ts
│       ├── package.json
│       └── tsconfig.json
│
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline
│
├── package.json                     # Root package.json
├── pnpm-workspace.yaml             # pnpm workspaces config
├── tsconfig.json                   # Base TypeScript config
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

### Workspace Configuration

**pnpm-workspace.yaml**:
```yaml
packages:
  - 'packages/*'
```

**Root package.json**:
```json
{
  "name": "youtube-to-ersatztv",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "pnpm --parallel --filter \"./packages/**\" dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "dev:backend": "pnpm --filter backend dev",
    "build": "pnpm --filter \"./packages/**\" build",
    "test": "pnpm --filter \"./packages/**\" test",
    "lint": "pnpm --filter \"./packages/**\" lint",
    "format": "prettier --write \"packages/**/*.{ts,tsx,json,md}\"",
    "deploy": "pnpm deploy:backend && pnpm deploy:frontend",
    "deploy:backend": "pnpm --filter backend deploy",
    "deploy:frontend": "pnpm --filter frontend deploy"
  },
  "devDependencies": {
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  },
  "packageManager": "pnpm@8.0.0"
}
```

---

## Development Workflow

### Local Development Setup

#### Prerequisites
```bash
# Install Node.js 20 LTS
# Install pnpm
npm install -g pnpm

# Clone repository
git clone <repository-url>
cd youtube-to-ersatztv

# Install dependencies
pnpm install
```

#### Environment Configuration

**Backend (.dev.vars)**:
```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```

**Frontend (.env)**:
```bash
VITE_API_URL=http://localhost:8787
```

#### Running Locally

**Start both frontend and backend**:
```bash
pnpm dev
```

**Start individually**:
```bash
# Frontend only (http://localhost:5173)
pnpm dev:frontend

# Backend only (http://localhost:8787)
pnpm dev:backend
```

### Cloudflare KV Setup

```bash
# Login to Cloudflare
npx wrangler login

# Create KV namespace for caching
npx wrangler kv:namespace create CACHE

# Update wrangler.toml with the namespace ID
# Set production secrets
npx wrangler secret put YOUTUBE_API_KEY
```

### Development Commands

```bash
# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build

# Type checking
pnpm --filter frontend tsc --noEmit
pnpm --filter backend tsc --noEmit
```

### Backend Development

**wrangler.toml**:
```toml
name = "ersatztv-api"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
preview_id = "your-preview-kv-namespace-id"

# Secrets (set via: wrangler secret put YOUTUBE_API_KEY)
# - YOUTUBE_API_KEY
```

**Example Hono Route**:
```typescript
// backend/src/routes/convert.ts
import { Hono } from 'hono';
import { getVideoMetadata } from '../services/youtube';
import { generateYaml } from '../services/yaml';

const convert = new Hono<{ Bindings: Env }>();

convert.post('/', async (c) => {
  const { url, includeDuration, scriptOptions } = await c.req.json();
  
  // Validate input
  // Fetch metadata from YouTube API (with caching)
  const metadata = await getVideoMetadata(url, c.env);
  
  // Generate YAML
  const yaml = generateYaml(metadata, { includeDuration, scriptOptions });
  
  return c.json({ yaml, metadata });
});

export default convert;
```

**Caching Service**:
```typescript
// backend/src/services/cache.ts
export async function getVideoMetadata(
  videoId: string,
  env: { CACHE: KVNamespace; YOUTUBE_API_KEY: string }
) {
  const cacheKey = `video:${videoId}`;
  
  // Check cache first
  const cached = await env.CACHE.get(cacheKey, 'json');
  if (cached) {
    console.log(`Cache hit for video: ${videoId}`);
    return cached;
  }
  
  // Fetch from YouTube API
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?` +
    `id=${videoId}&` +
    `key=${env.YOUTUBE_API_KEY}&` +
    `part=contentDetails,snippet,liveStreamingDetails`
  );
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache for 1 hour (3600 seconds)
  await env.CACHE.put(cacheKey, JSON.stringify(data), {
    expirationTtl: 3600
  });
  
  console.log(`Cached video metadata: ${videoId}`);
  return data;
}
```

### Frontend Development

**API Service**:
```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export async function convertVideo(
  url: string,
  options: { includeDuration: boolean; scriptOptions: string }
) {
  const response = await axios.post(`${API_URL}/api/convert`, {
    url,
    ...options
  });
  return response.data;
}

export async function convertPlaylist(
  url: string,
  options: { includeDuration: boolean; scriptOptions: string }
) {
  const response = await axios.post(`${API_URL}/api/convert/playlist`, {
    url,
    ...options
  });
  return response.data;
}
```

### CORS Configuration

```typescript
// backend/src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import convert from './routes/convert';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
  origin: [
    'http://localhost:5173',           // Local development
    'https://your-domain.pages.dev',   // Production frontend
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type'],
  maxAge: 86400,
}));

// Routes
app.route('/api/convert', convert);

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }));

export default app;
```

---

## Deployment Strategy

### Cloudflare Infrastructure

#### Frontend: Cloudflare Pages
- **Automatic deployments** from Git
- **Global CDN** with edge caching
- **Free SSL/TLS** certificates
- **Preview deployments** for pull requests
- **Custom domains** support

#### Backend: Cloudflare Workers
- **Edge computing** (300+ locations worldwide)
- **Automatic scaling**
- **10ms CPU time** on free tier (50ms on Workers Paid)
- **100k requests/day** on free tier (10M on Workers Paid)

#### Storage: Cloudflare KV
- **100k reads/day** on free tier
- **1k writes/day** on free tier
- **Global replication**
- **Low latency** edge access

### Deployment Process

#### One-Time Setup

```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Create KV namespace
npx wrangler kv:namespace create CACHE
npx wrangler kv:namespace create CACHE --preview

# 3. Update wrangler.toml with namespace IDs

# 4. Set secrets
npx wrangler secret put YOUTUBE_API_KEY

# 5. Connect GitHub repository to Cloudflare Pages
# (via Cloudflare dashboard)
```

#### Manual Deployment

**Deploy Backend**:
```bash
cd packages/backend
pnpm deploy
# or from root: pnpm deploy:backend
```

**Deploy Frontend**:
```bash
cd packages/frontend
pnpm build
npx wrangler pages deploy dist
# or from root: pnpm deploy:frontend
```

#### Automated CI/CD

**GitHub Actions Workflow**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Lint code
        run: pnpm lint
      
      - name: Build packages
        run: pnpm build
      
      - name: Deploy Backend to Cloudflare Workers
        if: github.ref == 'refs/heads/main'
        run: pnpm deploy:backend
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
      
      - name: Deploy Frontend to Cloudflare Pages
        if: github.ref == 'refs/heads/main'
        run: pnpm deploy:frontend
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**Required GitHub Secrets**:
- `CLOUDFLARE_API_TOKEN`: API token with Workers and Pages permissions
- `YOUTUBE_API_KEY`: (Optional, can be set via wrangler secrets)

### Environment Management

#### Development
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8787`
- KV: Preview namespace

#### Production
- Frontend: `https://your-domain.pages.dev`
- Backend: `https://api.your-domain.workers.dev`
- KV: Production namespace

### Monitoring & Logging

**Cloudflare Analytics**:
- Request volume
- Bandwidth usage
- Cache hit ratio
- Error rates

**Workers Logs**:
```bash
# Real-time logs
npx wrangler tail

# Filter logs
npx wrangler tail --status error
```

**KV Metrics**:
- Read/write operations
- Storage usage
- Cache effectiveness

### Rollback Strategy

```bash
# List deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback [deployment-id]
```

---

## Implementation Phases

### Phase 1: Core Functionality (MVP)
**Duration**: 2-3 weeks

**Goals**:
- Basic UI with single input field
- "Always include duration" checkbox option
- YouTube API integration for single videos
- YAML generation with correct structure
- Single file download
- Basic error handling

**Deliverables**:
- Working frontend with URL input
- Backend API endpoint for single video conversion
- YouTube API integration with caching
- YAML generation service
- Download functionality
- Deployed to Cloudflare (dev environment)

**Success Criteria**:
- User can input YouTube URL
- System generates valid YAML file
- User can download YAML file
- Error messages for invalid URLs

### Phase 2: Enhanced Features
**Duration**: 2-3 weeks

**Goals**:
- Playlist support
- Multiple download format options (ZIP)
- YAML preview with syntax highlighting
- Basic script customization
- Improved error handling

**Deliverables**:
- Playlist processing capability
- ZIP archive generation (client-side)
- Syntax-highlighted YAML preview
- Editable script field with validation
- Enhanced UI/UX
- Comprehensive error handling

**Success Criteria**:
- User can process playlists
- User can download multiple files as ZIP
- User can preview YAML before download
- User can customize script options
- System validates script modifications

### Phase 3: Advanced Features
**Duration**: 2-3 weeks

**Goals**:
- Script validation and option management
- Batch processing optimization
- User preferences/saved configurations
- Error recovery and retry mechanisms
- Performance optimization

**Deliverables**:
- Advanced script validation
- Optimized playlist processing
- Local storage for user preferences
- Retry logic for failed requests
- Loading states and progress indicators
- Analytics integration

**Success Criteria**:
- System prevents invalid script modifications
- Large playlists process efficiently
- User preferences persist across sessions
- Failed requests retry automatically
- User sees clear progress feedback

### Phase 4: Polish & Optimization
**Duration**: 1-2 weeks

**Goals**:
- Performance optimization
- Enhanced error messages
- Documentation and help section
- Usage analytics
- Production deployment
- User testing and feedback

**Deliverables**:
- Optimized bundle sizes
- Comprehensive user documentation
- Help/FAQ section
- Analytics dashboard
- Production-ready deployment
- User feedback mechanism

**Success Criteria**:
- Fast load times (<2s)
- Clear, helpful documentation
- Analytics tracking key metrics
- Positive user feedback
- Zero critical bugs

---

## Technical Requirements

### Backend Requirements

#### API & Services
- **YouTube Data API v3**:
  - API key with sufficient quota
  - Video metadata extraction
  - Playlist item enumeration
  - Live stream detection

#### Processing
- **YAML generation**:
  - js-yaml or native string templating
  - Proper formatting and escaping
  - Validation before response

#### Caching
- **Cloudflare KV**:
  - Video metadata caching (1 hour TTL)
  - Playlist metadata caching
  - Cache invalidation strategy

#### Validation
- **Input sanitization**:
  - URL validation
  - Script option validation
  - SQL injection prevention
  - XSS prevention

#### Error Handling
- **Graceful degradation**:
  - API quota exceeded
  - Rate limiting
  - Network timeouts
  - Invalid/deleted content

### Frontend Requirements

#### Core Features
- **Responsive design**:
  - Mobile-friendly (320px+)
  - Tablet optimization (768px+)
  - Desktop experience (1024px+)

#### UI Components
- **shadcn/ui components**:
  - Input fields
  - Buttons
  - Checkboxes
  - Dropdowns
  - Loading spinners
  - Toast notifications
  - Tooltips

#### Libraries
- **YAML handling**:
  - js-yaml for parsing/generation
  - Syntax highlighting (react-syntax-highlighter)

#### File Handling
- **Download functionality**:
  - Single file download
  - ZIP archive creation (JSZip)
  - Proper filename sanitization

#### Validation
- **Form validation**:
  - URL format checking
  - Real-time validation feedback
  - Error message display

### Shared Requirements

#### TypeScript
- **Type definitions**:
  - API request/response types
  - YAML structure types
  - YouTube API response types
  - Shared constants

#### Testing
- **Unit tests**:
  - Component testing (Vitest + React Testing Library)
  - API endpoint testing
  - Utility function testing
  - Validation logic testing

#### Code Quality
- **Linting & Formatting**:
  - ESLint with TypeScript rules
  - Prettier for consistent formatting
  - Pre-commit hooks (Husky)

---

## Security Considerations

### 1. API Key Protection
- **Never expose YouTube API keys** in client-side code
- Store API keys in Cloudflare Workers secrets
- Rotate API keys periodically
- Monitor API usage for anomalies

### 2. Input Sanitization
- **Validate all user inputs**:
  - URL format validation
  - Script option whitelist/blacklist
  - Prevent script injection
  - Escape special characters in YAML

### 3. Rate Limiting
- **Prevent abuse**:
  - Implement request throttling (per IP)
  - Queue management for playlists
  - Fair usage policies
  - Cloudflare rate limiting rules

### 4. CORS Configuration
- **Proper cross-origin resource sharing**:
  - Whitelist specific origins
  - Limit allowed methods
  - Set appropriate headers
  - No wildcard origins in production

### 5. Script Injection Prevention
- **Strict validation** of script modifications:
  - Whitelist allowed yt-dlp options
  - Validate against blacklist
  - Prevent command chaining (`;`, `&&`, `||`)
  - Ensure `-o -` remains intact

### 6. Content Security Policy
- **CSP headers**:
  - Restrict script sources
  - Prevent inline scripts
  - Control resource loading
  - XSS protection

### 7. HTTPS Enforcement
- **Secure communication**:
  - Cloudflare automatic SSL/TLS
  - HSTS headers
  - Secure cookies (if used)

### 8. Dependency Security
- **Regular updates**:
  - Automated dependency scanning
  - Security patch monitoring
  - Minimal dependency footprint

---

## Performance Considerations

### Frontend Optimization

#### Bundle Size
- **Code splitting**:
  - Lazy loading for routes
  - Dynamic imports for heavy libraries
  - Tree shaking unused code

#### Target Metrics
- **Initial bundle**: <200KB gzipped
- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s

#### Caching Strategy
- **Static assets**:
  - Long-term caching (1 year)
  - Content-based hashing
  - CDN edge caching

### Backend Optimization

#### Cloudflare Workers
- **Cold start optimization**:
  - Minimal dependencies
  - Lazy imports
  - Keep bundle size small

#### CPU Time Management
- **Stay within limits**:
  - Free tier: 10ms CPU time per request
  - Paid tier: 50ms CPU time per request
  - Optimize heavy operations

#### Caching Strategy
- **Cloudflare KV**:
  - Cache YouTube API responses (1 hour TTL)
  - Reduce API quota usage
  - Improve response times
  - Cache hit ratio monitoring

### API Optimization

#### YouTube API
- **Batch requests**:
  - Request multiple video IDs at once (max 50)
  - Reduce API calls for playlists
  - Pagination for large playlists (50 items/page)

#### Request Optimization
- **Minimize data transfer**:
  - Request only needed fields (`part` parameter)
  - Compress responses
  - Use conditional requests (ETags)

### Database/Storage Optimization

#### Cloudflare KV
- **Efficient key design**:
  - Hierarchical keys: `video:{videoId}`
  - Short keys to reduce storage
  - Batch operations where possible

#### Cache Invalidation
- **TTL strategy**:
  - Video metadata: 1 hour
  - Playlist metadata: 30 minutes
  - Live stream status: 5 minutes

### Monitoring

#### Performance Metrics
- **Track key metrics**:
  - API response times
  - Cache hit ratio
  - Error rates
  - User flow completion rates

#### Cloudflare Analytics
- **Built-in insights**:
  - Request volume
  - Bandwidth usage
  - Geographic distribution
  - Error rates by endpoint

---

## Future Enhancements

### Short-Term (3-6 months)

#### Feature Additions
- **Batch URL processing**: Multiple URLs in a single operation
- **Template system**: Save and reuse common configurations
- **URL history**: Recent conversions saved locally
- **Dark mode**: Theme toggle for better accessibility
- **Keyboard shortcuts**: Power user efficiency

#### Technical Improvements
- **Browser extension**: One-click conversion from YouTube
- **API documentation**: Public API for advanced users
- **Webhook support**: Notify external services on completion
- **Export formats**: JSON, CSV metadata export

### Medium-Term (6-12 months)

#### Platform Expansion
- **Support for other video platforms**:
  - Twitch
  - Vimeo
  - Dailymotion
  - Custom RTMP/HLS streams

#### Advanced Features
- **ErsatzTV API integration**:
  - Direct upload to ErsatzTV instance
  - Authentication with ErsatzTV
  - Remote stream management

#### Collaboration Features
- **User accounts** (optional):
  - Save configurations
  - Share templates
  - Usage statistics

### Long-Term (12+ months)

#### Enterprise Features
- **Self-hosted option**: Docker container for private deployment
- **Advanced scripting**: Custom yt-dlp configurations
- **Scheduling**: Automated periodic updates
- **Monitoring**: Health checks for remote streams

#### Community Features
- **Public template library**: User-contributed configurations
- **Rating system**: Community feedback on templates
- **Discussion forum**: Support and ideas

---

## Success Metrics

### User Engagement
- **Active users**: Daily/monthly active users
- **Conversion rate**: Visitors who generate YAML files
- **Retention rate**: Users who return within 30 days
- **Session duration**: Average time spent on application

### Technical Performance
- **API success rate**: >99% successful YAML generations
- **Average response time**: <2s for single videos, <5s for playlists
- **Cache hit ratio**: >70% for repeat requests
- **Error rate**: <1% of all requests

### User Satisfaction
- **Feedback collection**: In-app feedback mechanism
- **Bug reports**: Track and resolve user-reported issues
- **Feature requests**: Community-driven roadmap
- **Net Promoter Score**: Target >50

### Business Metrics
- **Cost efficiency**:
  - Cloudflare free tier utilization
  - YouTube API quota usage
  - Infrastructure costs

- **Growth metrics**:
  - Month-over-month user growth
  - Organic traffic vs referrals
  - Social media mentions

---

## Timeline

### Phase 1: Core Functionality (MVP)
**Weeks 1-3**
- Week 1: Project setup, monorepo structure, basic UI
- Week 2: YouTube API integration, YAML generation
- Week 3: Download functionality, testing, initial deployment

### Phase 2: Enhanced Features
**Weeks 4-6**
- Week 4: Playlist support, ZIP archive generation
- Week 5: YAML preview, syntax highlighting
- Week 6: Script customization, validation

### Phase 3: Advanced Features
**Weeks 7-9**
- Week 7: Advanced validation, optimization
- Week 8: User preferences, error recovery
- Week 9: Performance tuning, analytics

### Phase 4: Polish & Optimization
**Weeks 10-11**
- Week 10: Documentation, help section, final testing
- Week 11: Production deployment, user feedback, iterations

### Total Estimated Duration
**7-11 weeks** from start to production-ready application

### Milestones
- **Week 3**: MVP deployed to staging
- **Week 6**: Feature-complete beta
- **Week 9**: Production candidate
- **Week 11**: Public launch

---

## Risks & Mitigation

### Technical Risks

#### Risk: YouTube API Quota Limits
- **Impact**: Service degradation if quota exceeded
- **Mitigation**: 
  - Aggressive caching (1-hour TTL)
  - Rate limiting per user
  - Monitor quota usage
  - Upgrade to higher quota if needed

#### Risk: Cloudflare Worker CPU Time Limits
- **Impact**: Timeouts for complex operations
- **Mitigation**:
  - Optimize code for performance
  - Upgrade to Workers Paid ($5/month for 50ms)
  - Offload heavy processing to client-side

#### Risk: yt-dlp Format Changes
- **Impact**: Generated scripts may break
- **Mitigation**:
  - Monitor yt-dlp releases
  - Version pinning recommendations
  - User notification system for updates

### Business Risks

#### Risk: Low User Adoption
- **Impact**: Limited usage, wasted effort
- **Mitigation**:
  - Community engagement (Reddit, Discord)
  - Documentation and tutorials
  - SEO optimization
  - Integration with ErsatzTV community

#### Risk: YouTube API Policy Changes
- **Impact**: Service may become non-compliant
- **Mitigation**:
  - Monitor YouTube API announcements
  - Stay within terms of service
  - Alternative data sources if needed

### Operational Risks

#### Risk: Cloudflare Service Outage
- **Impact**: Application unavailable
- **Mitigation**:
  - Cloudflare's 99.99% uptime SLA
  - Status page for transparency
  - Minimal blast radius (stateless design)

---

## Conclusion

This YouTube to ErsatzTV Remote Stream Converter will provide a streamlined, user-friendly solution for creating ErsatzTV-compatible YAML files from YouTube content. The phased approach allows for iterative development and early user feedback while maintaining a clear path to a full-featured, production-ready application.

The use of modern web technologies, monorepo architecture, and Cloudflare's edge network ensures a fast, reliable, and scalable solution that can grow with user demand. The project is well-positioned to serve the ErsatzTV community and simplify the process of integrating YouTube content into personal streaming setups.

---

## Appendix

### A. Reference Links

- **ErsatzTV Documentation**: https://ersatztv.org/docs/
- **Remote Stream Definition**: https://ersatztv.org/docs/media/local/remotestreams/definition
- **Remote Stream Samples**: https://ersatztv.org/docs/media/local/remotestreams/sample
- **YouTube Data API v3**: https://developers.google.com/youtube/v3
- **yt-dlp Documentation**: https://github.com/yt-dlp/yt-dlp
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Hono Framework**: https://hono.dev/

### B. Example YAML Files

**Single Video (VOD)**:
```yaml
script: "yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -"
is_live: false
```

**Single Video (VOD with duration)**:
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

### C. API Examples

**Convert Single Video Request**:
```http
POST /api/convert
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
  "includeDuration": false,
  "scriptOptions": "--hls-use-mpegts"
}
```

**Convert Single Video Response**:
```json
{
  "yaml": "script: \"yt-dlp https://youtube.com/watch?v=dQw4w9WgXcQ --hls-use-mpegts -o -\"\nis_live: false",
  "metadata": {
    "title": "Rick Astley - Never Gonna Give You Up",
    "duration": "00:03:33",
    "isLive": false,
    "videoId": "dQw4w9WgXcQ"
  }
}
```

**Convert Playlist Request**:
```http
POST /api/convert/playlist
Content-Type: application/json

{
  "url": "https://youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
  "includeDuration": true,
  "scriptOptions": "--hls-use-mpegts"
}
```

**Convert Playlist Response**:
```json
{
  "videos": [
    {
      "yaml": "script: \"yt-dlp https://youtube.com/watch?v=VIDEO_ID_1 --hls-use-mpegts -o -\"\nis_live: false\nduration: 00:05:23",
      "filename": "video-title-1.yml",
      "metadata": {
        "title": "Video Title 1",
        "duration": "00:05:23",
        "isLive": false,
        "videoId": "VIDEO_ID_1"
      }
    },
    {
      "yaml": "script: \"yt-dlp https://youtube.com/watch?v=VIDEO_ID_2 --hls-use-mpegts -o -\"\nis_live: false\nduration: 00:08:15",
      "filename": "video-title-2.yml",
      "metadata": {
        "title": "Video Title 2",
        "duration": "00:08:15",
        "isLive": false,
        "videoId": "VIDEO_ID_2"
      }
    }
  ]
}
```

### D. Contact & Support

For questions or feedback about this proposal:
- **Project Repository**: [To be created]
- **Issue Tracker**: [To be created]
- **Email**: [To be provided]

---

**End of Proposal**
