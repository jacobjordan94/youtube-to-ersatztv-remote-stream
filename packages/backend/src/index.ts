import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Env } from './types';
import convert from './routes/convert';
import health from './routes/health';

const app = new Hono<{ Bindings: Env }>();

app.use(
  '/*',
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://*.pages.dev',
    ],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
    maxAge: 86400,
  })
);

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
