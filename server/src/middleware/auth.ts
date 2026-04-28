import { Request, Response, NextFunction } from 'express';

export interface AuthRequest extends Request {
  userId?: number;
  username?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const session = req.cookies?.pulsehub_session;
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Simple signed session: "userId:username:timestamp"
    const [userId, username] = Buffer.from(session, 'base64').toString().split(':');
    if (!userId || !username) throw new Error('Invalid session');
    req.userId = parseInt(userId);
    req.username = username;
    next();
  } catch {
    res.clearCookie('pulsehub_session');
    return res.status(401).json({ error: 'Invalid session' });
  }
}