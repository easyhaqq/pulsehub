import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db/pool';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username.trim().toLowerCase()]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session token
    const sessionData = Buffer.from(`${user.id}:${user.username}:${Date.now()}`).toString('base64');

    res.cookie('pulsehub_session', sessionData, {
      httpOnly: true,
      secure: false,        // Set true in production (HTTPS)
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    return res.json({ success: true, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('pulsehub_session');
  return res.json({ success: true });
});

// GET /api/me
router.get('/me', requireAuth, (req: AuthRequest, res) => {
  return res.json({ userId: req.userId, username: req.username });
});

export default router;