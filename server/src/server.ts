import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRouter from './routes/auth';
import postsRouter from './routes/posts';

const app = express();
const PORT = 5005;

app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// General limiter — generous, for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter — login only
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
});

app.use(generalLimiter);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

// Apply strict limiter ONLY to login route
app.use('/api/login', loginLimiter);

// Routes
app.use('/api', authRouter);
app.use('/api/posts', postsRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', port: PORT }));

app.listen(PORT, '127.0.0.1', () => {
  console.log(`✅ PulseHub backend running on http://127.0.0.1:${PORT}`);
});