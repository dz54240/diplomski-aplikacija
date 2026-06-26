import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export interface ServiceJwtContext {
  aud: 'node-agent';
  user_id?: string;
  document_id?: string;
  subject_id?: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      context?: ServiceJwtContext;
    }
  }
}

export function verifyServiceJwt(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'missing bearer token' });
    return;
  }

  const token = header.slice('Bearer '.length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'JWT_SECRET not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { aud?: string; [k: string]: unknown };
    if (decoded.aud !== 'node-agent') {
      res.status(401).json({ error: 'invalid audience' });
      return;
    }
    req.context = decoded as unknown as ServiceJwtContext;
    next();
  } catch (e) {
    res.status(401).json({ error: 'invalid token', detail: (e as Error).message });
  }
}
