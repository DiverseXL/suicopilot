import dotenv from 'dotenv';
dotenv.config(); // MUST be first line before any other imports

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import agentsRoute from './routes/agents.route';
import { restoreFromIndex } from './services/walrus-recovery.service';
import { startScheduler } from './services/scheduler.service';
import { validateEnv } from './config/env';
import { broadcast, sseClients } from './realtime';

export { broadcast, sseClients };

validateEnv();

const app = express();
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://suicopilot.vercel.app',
    'https://suicopilot-frontend.vercel.app',
    'https://diversexl-suicopilot.vercel.app',
  ],
  credentials: true,
}));
app.use(helmet());
app.use(express.json());
app.use('/api/agents', agentsRoute);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

function mountSseRoute(path: string) {
  app.get(path, (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    sseClients.add(res);
    console.log(`[SSE] Client connected. Total: ${sseClients.size}`);

    req.on('close', () => {
      sseClients.delete(res);
      console.log(`[SSE] Client disconnected. Total: ${sseClients.size}`);
    });
  });
}

mountSseRoute('/events');
mountSseRoute('/api/events');

async function bootstrap() {
  await restoreFromIndex();
  startScheduler();

  const PORT = process.env.PORT ?? 3001;
  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
    console.log(`[SSE] stream at http://localhost:${PORT}/events`);
  });
}

bootstrap().catch(console.error);
