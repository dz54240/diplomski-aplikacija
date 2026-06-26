import 'dotenv/config';
import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { verifyServiceJwt } from './lib/jwt.js';
import { verifyUserJwt } from './lib/user-jwt.js';
import { ingestHandler } from './routes/ingest.js';
import { chatHandler } from './routes/chat.js';
import { quizHandler } from './routes/quiz.js';
import { tutorHandler } from './routes/tutor.js';
import { historyChunksHandler } from './routes/history-chunks.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'node-agent' });
});

app.post('/ingest', verifyServiceJwt, ingestHandler);
app.post('/chat', verifyUserJwt, chatHandler);
app.post('/quiz', verifyUserJwt, quizHandler);
app.post('/tutor', verifyUserJwt, tutorHandler);
app.get('/conversations/:id/chunks', verifyUserJwt, historyChunksHandler);

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT ?? 4000);
  app.listen(port, () => {
    console.log(`node-agent listening on :${port}`);
  });
}

export { app };
