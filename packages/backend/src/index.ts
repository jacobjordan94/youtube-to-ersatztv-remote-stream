import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import convert from './routes/convert';
import health from './routes/health';

const app = new Hono<{ Bindings: Env }>();

// Environment-aware CORS configuration
app.use('/*', (c, next) => {
  const env = c.env?.ENVIRONMENT || 'development';

  // Development: Allow localhost
  // Production: Only allow specific domain
  const allowedOrigins =
    env === 'production'
      ? ['https://youtube-to-ersatztv.jacob-jordan.me']
      : [
          'http://localhost:5173',
          'http://localhost:3000',
          'https://youtube-to-ersatztv.jacob-jordan.me',
        ];

  return cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  })(c, next);
});

// Security headers
app.use('/*', async (c, next) => {
  await next();

  // Content Security Policy
  c.header(
    'Content-Security-Policy',
    "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'"
  );

  // Prevent clickjacking
  c.header('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');

  // Enable browser XSS protection
  c.header('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  c.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
});

app.route('/api/convert', convert);
app.route('/health', health);

app.get('/', (c) => {
  return c.json({
    name: 'YouTube to ErsatzTV API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      convertVideo: 'POST /api/convert',
      convertPlaylist: 'POST /api/convert/playlist',
    },
  });
});

export default app;
