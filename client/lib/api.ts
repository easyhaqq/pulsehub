export type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  image_url: string;
  author: string;
  category: string;
  categories: string[];
  is_published: boolean;
  view_count: number;
  created_at: string;
  pulse_score?: number;
};

export type FeedResponse = {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
};

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (username: string, password: string) =>
    apiFetch<{ success: boolean; username: string }>('/api/login', {
      method: 'POST', body: JSON.stringify({ username, password }),
    }),
  logout: () => apiFetch('/api/logout', { method: 'POST' }),
  me: () => apiFetch<{ userId: number; username: string }>('/api/me'),
  getFeed: (cursor?: string) =>
    apiFetch<FeedResponse>(`/api/posts${cursor ? `?cursor=${cursor}` : ''}`),
  getCategory: (cat: string) =>
    apiFetch<{ posts: Post[] }>(`/api/posts/category/${cat}`),
  getAllPosts: () => apiFetch<Post[]>('/api/posts/all'),
  getPost: (slug: string) => apiFetch<Post>(`/api/posts/${slug}`),
  createPost: (data: Partial<Post>) =>
    apiFetch<Post>('/api/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id: number, data: Partial<Post>) =>
    apiFetch<Post>(`/api/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePost: (id: number) =>
    apiFetch(`/api/posts/${id}`, { method: 'DELETE' }),
};

export const CATEGORIES = ['Home', 'Latest', 'Tech', 'Business', 'Entertainment', 'Sports'];