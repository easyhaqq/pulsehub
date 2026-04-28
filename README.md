# PulseHub — Enterprise News & Media Platform

> A high-performance, full-stack news publishing platform built for the modern web. Fast by default, secure by design, and optimized for Google.

![PulseHub Banner](https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=400&fit=crop)

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Express](https://img.shields.io/badge/Express-4-black?style=flat-square&logo=express)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Security Model](#security-model)
- [SEO & Performance](#seo--performance)
- [The Pulse Algorithm](#the-pulse-algorithm)
- [Admin Panel](#admin-panel)
- [Rich Text Editor](#rich-text-editor)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

PulseHub is a production-grade news and media CMS built from the ground up with performance, security, and editorial workflow as first-class concerns. It is not a WordPress fork, not a SaaS template — it is a purpose-built system designed to serve breaking news at scale.

The platform is split into two independent services that communicate through a secure internal proxy tunnel, completely eliminating cross-origin issues and browser firewall interference common in Windows development environments.

**Who is this for?**

- Independent journalists and news organizations
- Digital media startups in emerging markets
- Developers building content-heavy platforms
- Agencies delivering news portals to clients

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│              fetch('/api/...') — same-origin                │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│              NEXT.JS FRONTEND — Port 3000                   │
│                                                             │
│  App Router · TypeScript · Tailwind CSS · TipTap Editor     │
│                                                             │
│  next.config.js rewrites:                                   │
│  /api/:path* → http://127.0.0.1:5005/api/:path*            │
│                    (The Security Tunnel)                     │
└─────────────────────────┬───────────────────────────────────┘
                          │ Internal proxy (no CORS)
┌─────────────────────────▼───────────────────────────────────┐
│              EXPRESS BACKEND — Port 5005                    │
│                                                             │
│  helmet · cors · express-rate-limit · cookie-parser         │
│  bcrypt · HTTP-only cookies · TypeScript                    │
└─────────────────────────┬───────────────────────────────────┘
                          │ pg Pool
┌─────────────────────────▼───────────────────────────────────┐
│                   POSTGRESQL DATABASE                       │
│                                                             │
│  users · posts · post_drafts                                │
│  Indexes · Views · Pulse Score Algorithm                    │
└─────────────────────────────────────────────────────────────┘
```

**Why this architecture?**

The Next.js rewrite proxy is the cornerstone of the design. All API calls use relative paths (`/api/login`, `/api/posts`) so the browser never directly contacts port 5005. This means:

1. Zero CORS preflight requests — the browser sees everything as same-origin
2. No Windows Firewall interference with cross-port requests
3. The backend port is never exposed to the public internet in production
4. HTTP-only cookies work without `SameSite` hacks

---

## Features

### Public-Facing
- **Pulse Score Feed** — proprietary algorithm that ranks articles by recency × engagement, not simple chronological order
- **Infinite Scroll** — cursor-based pagination; no "Page 2" button
- **Category Pages** — Tech, Business, Entertainment, Sports, Latest
- **Article Pages** — SSR-rendered for instant Google indexing
- **Full-Text Search** — PostgreSQL `ILIKE` across title, excerpt, and body
- **View Counter** — real-time engagement tracking per article
- **Share Button** — native share sheet on mobile, clipboard fallback on desktop
- **Responsive Design** — mobile-first, tested from 320px to 4K

### Admin Panel
- **Secure Authentication** — bcrypt + HTTP-only session cookies
- **Rate Limiting** — 10 login attempts per 15 minutes, hard blocked
- **Rich Text Editor** — TipTap-powered with full formatting suite
- **Multi-Category Tagging** — publish one article to multiple categories simultaneously
- **SEO Dashboard** — real-time score, keyword checks, Google preview
- **Autosave** — content saved every 30 seconds, 10-version history
- **Article Scheduling** — draft, pending, published, scheduled statuses
- **Internal Linking Tool** — search existing articles and embed links without leaving the editor
- **Image Preview** — live preview of cover image as you type the URL
- **Read Time Calculator** — auto-computed from word count (200 WPM baseline)

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js | 16 | App Router, SSR, Image optimization |
| Language | TypeScript | 5 | Type safety across the full stack |
| Styling | Tailwind CSS | 3 | Utility-first, no runtime CSS |
| Icons | Lucide React | Latest | Consistent icon system |
| Rich Text | TipTap | 2 | Extensible ProseMirror-based editor |
| Backend | Express.js | 4 | REST API server |
| Database | PostgreSQL | 16 | Primary data store |
| Auth | bcrypt + cookies | — | Password hashing, session management |
| Security | Helmet | 7 | HTTP security headers |
| Rate Limiting | express-rate-limit | 7 | Brute force protection |

---

## Prerequisites

Before you begin, ensure you have the following installed:

| Tool | Minimum Version | Check |
|------|----------------|-------|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| PostgreSQL | 14.x | `psql --version` |
| pgAdmin | 4.x | GUI optional |

> **Windows Users:** Use Command Prompt (`cmd`) rather than PowerShell to avoid script execution policy issues. If you must use PowerShell, run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` first.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pulsehub.git
cd pulsehub
```

### 2. Install backend dependencies

```bash
cd server
npm install
```

### 3. Install frontend dependencies

```bash
cd ../client
npm install
```

---

## Database Setup

### Step 1 — Create the database

Open pgAdmin, right-click **Databases** → **Create** → **Database**, name it `pulsehub`.

### Step 2 — Run the schema

Open the **Query Tool** on the `pulsehub` database and execute:

```sql
-- Core tables
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  username        VARCHAR(50) UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id               SERIAL PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  excerpt          TEXT,
  content          TEXT,
  image_url        TEXT,
  author_id        INTEGER REFERENCES users(id) ON DELETE SET NULL,
  is_published     BOOLEAN DEFAULT false,
  category         VARCHAR(50) DEFAULT 'General',
  categories       TEXT[] DEFAULT '{}',
  view_count       INTEGER DEFAULT 0,
  meta_title       TEXT,
  meta_description TEXT,
  focus_keyword    VARCHAR(100),
  custom_slug      TEXT,
  scheduled_at     TIMESTAMPTZ,
  status           VARCHAR(20) DEFAULT 'draft',
  read_time        INTEGER DEFAULT 0,
  co_authors       TEXT[] DEFAULT '{}',
  version          INTEGER DEFAULT 1,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_drafts (
  id        SERIAL PRIMARY KEY,
  post_id   INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  content   TEXT,
  saved_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_posts_published    ON posts(is_published);
CREATE INDEX IF NOT EXISTS idx_posts_created      ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category     ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_pulse_score  ON posts(is_published, created_at DESC, view_count DESC);
```

### Step 3 — Seed the admin user

```bash
cd server
npm run seed
```

This creates the master admin account: **username:** `admin` / **password:** `admin123`

> **Security Warning:** Change this password immediately in any environment beyond your local machine. Run the seed script, then update the password hash in the database with a new bcrypt hash.

---

## Configuration

### Backend — `server/src/db/pool.ts`

```typescript
export const pool = new Pool({
  host:     'localhost',
  port:     5432,
  database: 'pulsehub',
  user:     'postgres',      // Your PostgreSQL username
  password: 'your_password', // Your PostgreSQL password
  max:      10,
  idleTimeoutMillis: 30000,
});
```

### Frontend — `client/next.config.js`

The proxy tunnel is pre-configured. Do not change the destination port unless you change the backend port to match.

```js
async rewrites() {
  return [{
    source: '/api/:path*',
    destination: 'http://127.0.0.1:5005/api/:path*',
  }];
}
```

### Image Domains — `client/next.config.js`

Add any external image hostnames you plan to use:

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'images.unsplash.com' },
    { protocol: 'https', hostname: '**.cloudinary.com' },
    { protocol: 'https', hostname: '**.amazonaws.com' },
  ],
}
```

---

## Running the Application

PulseHub requires **two terminal windows** running simultaneously.

### Terminal 1 — Backend

```bash
cd server
npm run dev
```

Expected output:
```
✅ PulseHub backend running on http://127.0.0.1:5005
```

### Terminal 2 — Frontend

```bash
cd client
npm run dev
```

Expected output:
```
▲ Next.js 16.x
✓ Ready on http://localhost:3000
```

### Access Points

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public news feed |
| `http://localhost:3000/category/tech` | Category page |
| `http://localhost:3000/news/[slug]` | Article page |
| `http://localhost:3000/search?q=query` | Search results |
| `http://localhost:3000/admin` | Admin dashboard |
| `http://localhost:3000/admin/login` | Admin login (not linked publicly) |

---

## Project Structure

```
pulsehub/
│
├── server/                          # Express backend
│   └── src/
│       ├── db/
│       │   └── pool.ts              # PostgreSQL connection pool
│       ├── middleware/
│       │   └── auth.ts              # Session cookie guard
│       ├── routes/
│       │   ├── auth.ts              # Login, logout, /me
│       │   └── posts.ts             # Full CRUD + search + autosave
│       ├── scripts/
│       │   └── seed.ts              # Admin user seeder
│       └── server.ts                # Entry point, middleware stack
│
├── client/                          # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx               # Root layout (Header + Footer)
│   │   ├── page.tsx                 # Homepage — Pulse feed
│   │   ├── globals.css              # Global styles + TipTap overrides
│   │   ├── admin/
│   │   │   ├── page.tsx             # Admin dashboard
│   │   │   └── login/
│   │   │       └── page.tsx         # Admin login
│   │   ├── news/[slug]/
│   │   │   └── page.tsx             # Article page (SSR)
│   │   ├── category/[category]/
│   │   │   └── page.tsx             # Category page
│   │   ├── search/
│   │   │   └── page.tsx             # Search results
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── components/
│   │   ├── Header.tsx               # Sticky nav, search, mobile menu
│   │   ├── Footer.tsx               # 4-column footer
│   │   ├── ArticleCard.tsx          # FeaturedCard, GridCard, ListCard
│   │   ├── ShareButton.tsx          # Native share / clipboard fallback
│   │   └── editor/
│   │       ├── RichTextEditor.tsx   # TipTap editor with full toolbar
│   │       └── SeoPanel.tsx         # Real-time SEO scoring panel
│   ├── lib/
│   │   └── api.ts                   # Typed fetch helpers + Post type
│   ├── next.config.js               # Proxy rewrite + image domains
│   ├── tailwind.config.js           # Brand palette + custom utilities
│   └── postcss.config.js
```

---

## API Reference

All endpoints are prefixed with `/api`. The frontend proxies these transparently.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/login` | Public | Login with username + password |
| `POST` | `/api/logout` | Public | Clear session cookie |
| `GET` | `/api/me` | 🔒 Required | Get current user info |

**Login request body:**
```json
{ "username": "admin", "password": "admin123" }
```

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/posts` | Public | Paginated feed (Pulse Score) |
| `GET` | `/api/posts?cursor=ISO_TIMESTAMP` | Public | Next page cursor |
| `GET` | `/api/posts/all` | 🔒 Required | All posts (admin) |
| `GET` | `/api/posts/category/:cat` | Public | Posts by category |
| `GET` | `/api/posts/search?q=term` | Public | Full-text search |
| `GET` | `/api/posts/search/internal?q=term` | 🔒 Required | Internal link search |
| `GET` | `/api/posts/:slug` | Public | Single post (increments view) |
| `POST` | `/api/posts` | 🔒 Required | Create post |
| `PATCH` | `/api/posts/:id` | 🔒 Required | Update post |
| `DELETE` | `/api/posts/:id` | 🔒 Required | Delete post |
| `POST` | `/api/posts/:id/autosave` | 🔒 Required | Save draft version |
| `GET` | `/api/posts/:id/versions` | 🔒 Required | Get version history |

**Create/Update post body:**
```json
{
  "title": "Breaking: Article Title",
  "excerpt": "Short summary for the feed",
  "content": "<p>Rich HTML content from TipTap</p>",
  "image_url": "https://images.unsplash.com/...",
  "is_published": true,
  "categories": ["Tech", "Latest"],
  "meta_title": "SEO optimized title",
  "meta_description": "120-160 char description for Google",
  "focus_keyword": "Nigerian tech startup",
  "custom_slug": "nigerian-tech-startup-raises-funding",
  "status": "published",
  "read_time": 5
}
```

### Feed Pagination

The feed uses cursor-based pagination for performance at scale. A timestamp cursor is safer than offset pagination because it does not drift when new posts are added mid-session.

```
GET /api/posts               → First page (12 posts)
GET /api/posts?cursor=ISO    → Next page from cursor timestamp
```

Response shape:
```json
{
  "posts": [...],
  "nextCursor": "2026-04-15T10:30:00.000Z",
  "hasMore": true
}
```

---

## Security Model

PulseHub takes a layered security approach. Each layer independently protects against a different class of attack.

### Layer 1 — Network (The Tunnel)
The Next.js rewrite proxy means port 5005 is bound to `127.0.0.1` (loopback only). It is physically unreachable from outside the machine. No CORS wildcard, no public exposure.

### Layer 2 — Transport (Helmet)
`helmet` sets the following HTTP headers on every response:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy`
- `X-XSS-Protection`

### Layer 3 — Authentication (bcrypt + HTTP-only cookies)
- Passwords hashed with bcrypt at cost factor 12 — computationally infeasible to brute force offline
- Sessions stored in HTTP-only cookies — JavaScript cannot read them, defeating XSS token theft
- `SameSite: lax` prevents CSRF from third-party sites

### Layer 4 — Rate Limiting
- Login endpoint: **10 requests per 15 minutes** per IP, hard blocked with `429 Too Many Requests`
- General API: **500 requests per 15 minutes** per IP
- Resets on server restart (in-memory store; swap for Redis in production for persistence across restarts)

### Layer 5 — Authorization
Every write operation (`POST`, `PATCH`, `DELETE`) passes through `requireAuth` middleware which validates the session cookie server-side before executing any SQL. A missing or tampered cookie returns `401 Unauthorized`.

### What this means in practice
The admin URL (`/admin/login`) is intentionally not linked from the public site. Even if a user discovers it by inspecting the JavaScript bundle, they face bcrypt-hardened passwords and a strict rate limiter. The URL being known is not a vulnerability — the authentication is.

---

## SEO & Performance

### Server-Side Rendering
Article pages (`/news/[slug]`) use Next.js `async` Server Components with `fetch` + `revalidate: 60`. Google's crawler receives fully-rendered HTML with zero JavaScript execution required. This is the single most impactful SEO decision in the architecture.

### Dynamic Metadata
Every article page generates unique Open Graph and Twitter Card metadata:

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    openGraph: {
      images: [{ url: post.image_url }],
      type: 'article',
      publishedTime: post.created_at,
    },
    twitter: { card: 'summary_large_image' },
  };
}
```

### Image Optimization
All images pass through `next/image`:
- Automatic WebP conversion
- Responsive `srcset` generation
- `priority` flag on above-the-fold featured images
- Lazy loading for all grid and list cards
- Blur placeholder during load

### Core Web Vitals Targets
| Metric | Target | Strategy |
|--------|--------|----------|
| LCP | < 2.5s | `priority` images, SSR, CDN |
| FID / INP | < 100ms | Minimal client JS, no layout thrash |
| CLS | < 0.1 | Fixed image dimensions via `fill` + aspect ratio containers |

### Database Performance
```sql
-- Composite index for the Pulse Score query
CREATE INDEX idx_posts_pulse_score ON posts(is_published, created_at DESC, view_count DESC);
```

---

## The Pulse Algorithm

The homepage feed is not a dumb chronological list. Each article receives a **Pulse Score** calculated as:

```
Pulse Score = (Unix Timestamp in Hours) + (view_count × 1.5)
```

**Why this works:**

An article published 2 hours ago starts with a baseline score of roughly `1,737,000` (current epoch/3600). Each view adds `1.5` to that score. This means:

- A brand new article with 0 views ranks above a week-old article
- An article with 500 views can outrank a newer article with 50 views
- The weight naturally decays as time passes — yesterday's viral story cannot permanently dominate

**Tuning the algorithm:**

Adjust the `1.5` multiplier in `server/src/routes/posts.ts` to change the balance between recency and engagement. Higher values favor viral content; lower values favor freshness.

---

## Admin Panel

The admin panel is accessible at `/admin` (requires authentication). The login page at `/admin/login` is not linked from any public page.

### Creating a Post

1. Navigate to `/admin` and sign in
2. Click **New Post**
3. Fill in the title — the URL slug auto-generates from it
4. Select one or more **categories** (a post can appear in Tech AND Latest simultaneously)
5. Write content in the **Rich Text Editor**
6. Fill in the **SEO panel** (right sidebar) — aim for a green score above 80%
7. Set status to **Published** or **Scheduled**
8. Click **Publish**

### Article Statuses

| Status | Behavior |
|--------|----------|
| `draft` | Not visible to the public |
| `pending` | Flagged for editorial review, not visible |
| `published` | Live on the public feed |
| `scheduled` | Will go live at the `scheduled_at` timestamp |

---

## Rich Text Editor

PulseHub uses **TipTap v2** (built on ProseMirror) for content editing.

### Toolbar Features

| Group | Features |
|-------|---------|
| History | Undo, Redo |
| Headings | H1, H2, H3, H4 (forced hierarchy, no skipping) |
| Formatting | Bold, Italic, Underline, Strikethrough, Highlight, Code |
| Alignment | Left, Center, Right, Justify |
| Lists | Bullet, Numbered, Blockquote, Divider |
| Media | Image URL, YouTube embed, Table (3×3 default) |
| Links | External URL, Internal article search |
| Preview | Desktop preview, Mobile preview toggle |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+U` | Underline |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |
| `Ctrl+K` | Insert link (select text first) |

### Autosave
When editing an existing post, content is automatically saved to `post_drafts` every **30 seconds**. The last 10 versions are retained. The status bar at the bottom of the editor shows the last autosave timestamp.

### Bubble Menu
Select any text in the editor to reveal a floating toolbar with quick access to Bold, Italic, Link, and Highlight.

---

## Deployment

> This section covers production deployment. The local development setup described above is not suitable for public traffic.

### Environment Variables

Create `server/.env`:
```env
PORT=5005
DATABASE_URL=postgresql://user:password@localhost:5432/pulsehub
NODE_ENV=production
COOKIE_SECRET=your-very-long-random-secret-string-here
```

Create `client/.env.local`:
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Production Checklist

- [ ] Change admin password from `admin123` to a strong password
- [ ] Set `secure: true` on cookies in `server/src/routes/auth.ts` (requires HTTPS)
- [ ] Replace in-memory rate limiter store with Redis for persistence across restarts
- [ ] Set `NODE_ENV=production` — Express automatically disables stack traces in error responses
- [ ] Configure a reverse proxy (Nginx or Caddy) in front of both services
- [ ] Enable PostgreSQL SSL connections
- [ ] Set up automated database backups
- [ ] Configure a CDN (Cloudflare) in front of the Next.js server
- [ ] Replace `127.0.0.1:5005` in `next.config.js` with your internal backend URL

### Nginx Configuration (example)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

The Express backend should **never** be directly exposed to the internet in production. The Next.js proxy tunnel handles all API traffic.

---

## Troubleshooting

### `npm install` fails with "running scripts is disabled"
**Cause:** Windows PowerShell execution policy.
**Fix:** Run `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned` or use `cmd` instead of PowerShell.

### `password authentication failed for user "postgres"`
**Cause:** Wrong database password in `server/src/db/pool.ts`.
**Fix:** Open pgAdmin → right-click your server → Properties → Connection tab to find your credentials. Or reset the password with `ALTER USER postgres WITH PASSWORD 'newpassword';` in pgAdmin's Query Tool.

### `Too many login attempts. Try again in 15 minutes.`
**Cause:** The rate limiter triggered during testing.
**Fix:** Restart the backend server (`Ctrl+C` then `npm run dev`) to reset the in-memory counter.

### `next.config.ts is not supported`
**Cause:** Your version of Next.js does not support TypeScript config files.
**Fix:** Rename to `next.config.js` and replace `export default` with `module.exports =`.

### Images not loading — `hostname is not configured`
**Cause:** The image's domain is not whitelisted in `next.config.js`.
**Fix:** Add the hostname to the `images.remotePatterns` array and restart the dev server.

### `relation "users" already exists`
**Cause:** You ran the schema SQL more than once.
**Fix:** This is harmless. Use `CREATE TABLE IF NOT EXISTS` to make the script idempotent. Your data is safe.

### Frontend shows "No posts yet" but posts exist in the database
**Cause:** Posts have `is_published = false` (draft status).
**Fix:** Go to `/admin`, find the post in the table, and click the **Draft** toggle to flip it to **Live**.

### Backend not reachable from frontend
**Cause:** The backend server is not running, or it crashed.
**Fix:** Check Terminal 1 (the backend window). Look for error output. Common cause is a bad database password in `pool.ts`.

---

## Roadmap

The following features are planned for future releases, in priority order:

- [ ] **Comments system** — threaded comments with moderation queue
- [ ] **Newsletter integration** — Mailchimp / Brevo API for the subscribe form
- [ ] **Multi-author management** — invite editors, assign roles (Admin, Editor, Contributor)
- [ ] **Analytics dashboard** — pageviews, top articles, traffic sources (charts)
- [ ] **Direct image upload** — drag-and-drop to S3 / Cloudinary instead of URL paste
- [ ] **Push notifications** — Web Push API for breaking news alerts
- [ ] **RSS feed** — `/rss.xml` for feed readers and Google News
- [ ] **Google News sitemap** — `sitemap.xml` auto-generated from published posts
- [ ] **Social auto-posting** — publish to X and Facebook on article publish
- [ ] **Dark mode** — system-preference aware theme toggle
- [ ] **Paywall / subscription** — premium content behind Paystack or Stripe

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes
# ...

# Commit with a meaningful message
git commit -m "feat: add RSS feed generation"

# Push and open a PR
git push origin feature/your-feature-name
```

### Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|--------|---------|
| `feat:` | New features |
| `fix:` | Bug fixes |
| `perf:` | Performance improvements |
| `docs:` | Documentation only |
| `refactor:` | Code changes that neither fix bugs nor add features |
| `chore:` | Build process, dependency updates |

---

## License

MIT License — see [LICENSE](LICENSE) for full text.

You are free to use this project commercially, modify it, and distribute it. Attribution is appreciated but not required.

---

## Acknowledgements

Built with the following open-source projects:

- [Next.js](https://nextjs.org) — The React Framework for the Web
- [TipTap](https://tiptap.dev) — The headless rich text editor
- [Tailwind CSS](https://tailwindcss.com) — A utility-first CSS framework
- [Lucide](https://lucide.dev) — Beautiful & consistent icons
- [Express](https://expressjs.com) — Fast, unopinionated web framework for Node.js
- [PostgreSQL](https://postgresql.org) — The world's most advanced open source database
- [node-postgres](https://node-postgres.com) — PostgreSQL client for Node.js

---

<div align="center">

Built with precision by the PulseHub team.

**[Live Demo](https://pulsehub.ng)** · **[Report a Bug](https://github.com/yourusername/pulsehub/issues)** · **[Request a Feature](https://github.com/yourusername/pulsehub/issues)**

</div>
