import { Router, Request, Response } from 'express';
import { pool } from '../db/pool';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 80);
}

// GET /api/posts — public feed with Pulse Score + cursor pagination
router.get('/', async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 12;
  const cursor = req.query.cursor as string | undefined;

  try {
    let query: string;
    let params: (string | number)[];

    if (cursor) {
      query = `
        SELECT p.id, p.title, p.slug, p.excerpt, p.image_url, p.category,
               p.categories, p.view_count, p.created_at, u.username AS author,
               (
                 (EXTRACT(EPOCH FROM p.created_at) / 3600) +
                 (p.view_count * 1.5)
               ) AS pulse_score
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.is_published = true
          AND p.created_at < $1::timestamptz
        ORDER BY pulse_score DESC, p.created_at DESC
        LIMIT $2
      `;
      params = [cursor, limit + 1];
    } else {
      query = `
        SELECT p.id, p.title, p.slug, p.excerpt, p.image_url, p.category,
               p.categories, p.view_count, p.created_at, u.username AS author,
               (
                 (EXTRACT(EPOCH FROM p.created_at) / 3600) +
                 (p.view_count * 1.5)
               ) AS pulse_score
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        WHERE p.is_published = true
        ORDER BY pulse_score DESC, p.created_at DESC
        LIMIT $1
      `;
      params = [limit + 1];
    }

    const { rows } = await pool.query(query, params);
    const hasMore = rows.length > limit;
    const posts = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? posts[posts.length - 1].created_at : null;

    return res.json({ posts, nextCursor, hasMore });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/category/:category — matches ANY in categories array
router.get('/category/:category', async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 12;
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.image_url, p.category,
             p.categories, p.view_count, p.created_at, u.username AS author
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_published = true
        AND (
          $1 = ANY(p.categories)
          OR LOWER(p.category) = LOWER($1)
        )
      ORDER BY p.created_at DESC
      LIMIT $2
    `, [req.params.category, limit]);
    return res.json({ posts: rows });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/all — admin: all posts
router.get('/all', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.image_url, p.category,
             p.categories, p.is_published, p.view_count, p.created_at,
             u.username AS author
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      ORDER BY p.created_at DESC
    `);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/search?q=...
router.get('/search', async (req: Request, res: Response) => {
  const q = (req.query.q as string || '').trim();
  if (!q) return res.json({ posts: [] });

  try {
    const { rows } = await pool.query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.image_url, p.category,
             p.categories, p.view_count, p.created_at, u.username AS author
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.is_published = true
        AND (
          p.title ILIKE $1
          OR p.excerpt ILIKE $1
          OR p.content ILIKE $1
        )
      ORDER BY p.created_at DESC
      LIMIT 24
    `, [`%${q}%`]);
    return res.json({ posts: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/posts/:slug — single post + increment view
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(`
      UPDATE posts SET view_count = view_count + 1
      WHERE slug = $1 AND is_published = true
      RETURNING *
    `, [req.params.slug]);

    if (!rows[0]) return res.status(404).json({ error: 'Not found' });

    const { rows: authorRows } = await pool.query(
      'SELECT username FROM users WHERE id = $1',
      [rows[0].author_id]
    );

    return res.json({ ...rows[0], author: authorRows[0]?.username });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/posts — create
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { title, excerpt, content, image_url, is_published, categories } = req.body as {
    title: string;
    excerpt?: string;
    content?: string;
    image_url?: string;
    is_published?: boolean;
    categories?: string[];
  };

  if (!title) return res.status(400).json({ error: 'Title required' });

  const slug = slugify(title) + '-' + Date.now().toString(36);
  const resolvedCategories = categories && categories.length > 0 ? categories : ['General'];
  const primaryCategory = resolvedCategories[0];

  try {
    const { rows } = await pool.query(`
      INSERT INTO posts (title, slug, excerpt, content, image_url, author_id, is_published, category, categories)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      title,
      slug,
      excerpt || '',
      content || '',
      image_url || '',
      req.userId,
      is_published ?? false,
      primaryCategory,
      resolvedCategories,
    ]);

    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PATCH /api/posts/:id — update
router.patch('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { title, excerpt, content, image_url, is_published, categories } = req.body as {
    title?: string;
    excerpt?: string;
    content?: string;
    image_url?: string;
    is_published?: boolean;
    categories?: string[];
  };

  const primaryCategory = categories && categories.length > 0 ? categories[0] : undefined;

  try {
    const { rows } = await pool.query(`
      UPDATE posts SET
        title        = COALESCE($1, title),
        excerpt      = COALESCE($2, excerpt),
        content      = COALESCE($3, content),
        image_url    = COALESCE($4, image_url),
        is_published = COALESCE($5, is_published),
        category     = COALESCE($6, category),
        categories   = COALESCE($7, categories),
        updated_at   = NOW()
      WHERE id = $8
      RETURNING *
    `, [
      title,
      excerpt,
      content,
      image_url,
      is_published,
      primaryCategory,
      categories,
      req.params.id,
    ]);

    if (!rows[0]) return res.status(404).json({ error: 'Post not found' });
    return res.json(rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/posts/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await pool.query('DELETE FROM posts WHERE id = $1', [req.params.id]);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;