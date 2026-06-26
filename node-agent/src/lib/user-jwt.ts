import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

export interface UserJwtContext {
  user_id: string;
  session_id: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userContext?: UserJwtContext;
    }
  }
}

export function verifyUserJwt(req: Request, res: Response, next: NextFunction): void {
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
    const decoded = jwt.verify(token, secret) as Record<string, unknown>;
    if (typeof decoded.user_id !== 'string') {
      res.status(401).json({ error: 'invalid user token' });
      return;
    }
    if ('aud' in decoded) {
      res.status(401).json({ error: 'service tokens cannot access /chat' });
      return;
    }
    req.userContext = {
      user_id: decoded.user_id,
      session_id: typeof decoded.session_id === 'string' ? decoded.session_id : '',
    };
    next();
  } catch (e) {
    res.status(401).json({ error: 'invalid token', detail: (e as Error).message });
  }
}
