'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, Post } from '../../lib/api';

type Tab = 'posts' | 'new';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('posts');
  const [posts, setPosts] = useState<Post[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
  title: '',
  excerpt: '',
  content: '',
  image_url: '',
  is_published: false,
  categories: ['General'] as string[],
});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const loadPosts = useCallback(async () => {
    const data = await api.getAllPosts();
    setPosts(data);
  }, []);

  useEffect(() => {
    api.me()
      .then(u => { setUsername(u.username); return loadPosts(); })
      .catch(() => router.replace('/admin/login'))
      .finally(() => setLoading(false));
  }, [router, loadPosts]);

 function resetForm() {
  setForm({ title: '', excerpt: '', content: '', image_url: '', is_published: false, categories: ['General'] });
  setEditId(null);
  setMessage('');
}

  async function handleLogout() {
    await api.logout();
    router.replace('/admin/login');
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      if (editId) {
        await api.updatePost(editId, form);
        setMessage('Post updated successfully.');
      } else {
        await api.createPost(form);
        setMessage('Post created successfully.');
      }
      resetForm();
      setTab('posts');
      await loadPosts();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : 'Error saving post');
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(post: Post) {
  setEditId(post.id);
  setForm({
    title: post.title,
    excerpt: post.excerpt,
    content: post.content || '',
    image_url: post.image_url,
    is_published: post.is_published,
    categories: Array.isArray(post.categories) ? post.categories : [post.category || 'General'],
  });
  setTab('new');
}

  async function handleDelete(id: number) {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await api.deletePost(id);
    await loadPosts();
  }

  async function togglePublish(post: Post) {
    await api.updatePost(post.id, { is_published: !post.is_published });
    await loadPosts();
  }

  if (loading) return (
    <div className="min-h-screen bg-ghost flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#E11D48] transition-colors text-sm shadow-sm';

  return (
    <div className="min-h-screen bg-ghost">

      {/* Admin Header */}
      <header className="bg-[#0F172A] border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1">
              <span className="text-xl font-extrabold text-[#E11D48]">Pulse</span>
              <span className="text-xl font-extrabold text-white">Hub</span>
            </Link>
            <span className="text-slate-700">|</span>
            <span className="text-sm text-slate-400 font-medium">Command Center</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Signed in as <span className="text-white font-medium">{username}</span>
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-slate-700 hover:border-red-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Posts', value: posts.length, color: 'text-[#0F172A]' },
            { label: 'Published', value: posts.filter(p => p.is_published).length, color: 'text-emerald-600' },
            { label: 'Drafts', value: posts.filter(p => !p.is_published).length, color: 'text-amber-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-sm">{stat.label}</p>
              <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 w-fit border border-slate-200 shadow-sm">
          {(['posts', 'new'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                if (t === 'new') resetForm();
              }}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === t
                  ? 'bg-[#E11D48] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {t === 'posts' ? '📋 All Posts' : editId ? '✏️ Edit Post' : '✨ New Post'}
            </button>
          ))}
        </div>

        {/* Posts Table */}
        {tab === 'posts' && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {posts.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-5xl mb-4">📝</p>
                <p className="text-lg font-medium text-slate-600">No posts yet</p>
                <p className="text-sm mt-1">Click "New Post" to publish your first story.</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Author</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {posts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-slate-900 font-medium text-sm line-clamp-1">{post.title}</p>
                        <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{post.excerpt}</p>
                      </td>
                      <td className="px-4 py-4 hidden md:table-cell">
                        <span className="category-badge">{post.category || 'General'}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-500 text-sm hidden md:table-cell">{post.author}</td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => togglePublish(post)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            post.is_published
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {post.is_published ? '● Live' : '○ Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="text-xs text-[#E11D48] hover:text-[#be123c] px-3 py-1.5 rounded-lg hover:bg-crimson-50 transition-all border border-crimson-100"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="text-xs text-slate-400 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-slate-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Post Form */}
        {tab === 'new' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-3xl shadow-sm">
            <h2 className="text-xl font-bold text-[#0F172A] mb-6">
              {editId ? '✏️ Edit Post' : '✨ Create New Post'}
            </h2>

            {message && (
              <div className={`mb-5 text-sm rounded-xl px-4 py-3 border ${
                message.includes('Error') || message.includes('error')
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {message}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Title *</label>
                <input
                  className={inputCls}
                  placeholder="Breaking: Something big happened..."
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div>
  <label className="block text-sm font-medium text-slate-700 mb-3">
    Categories <span className="text-slate-400 font-normal">(select all that apply)</span>
  </label>
  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
    {['General', 'Latest', 'Tech', 'Business', 'Entertainment', 'Sports'].map(cat => {
      const checked = form.categories.includes(cat);
      return (
        <label
          key={cat}
          className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
            checked
              ? 'bg-crimson-50 border-[#E11D48] text-[#E11D48]'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => {
              setForm(f => ({
                ...f,
                categories: checked
                  ? f.categories.filter(c => c !== cat)
                  : [...f.categories, cat],
              }));
            }}
            className="hidden"
          />
          <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
            checked ? 'bg-[#E11D48] border-[#E11D48]' : 'border-slate-300'
          }`}>
            {checked && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm font-medium">{cat}</span>
        </label>
      );
    })}
  </div>
</div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Excerpt</label>
                <input
                  className={inputCls}
                  placeholder="A short summary shown in the feed..."
                  value={form.excerpt}
                  onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={12}
                  placeholder="Write your full article here..."
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                <input
                  className={inputCls}
                  placeholder="https://images.unsplash.com/photo-..."
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                />
                {form.image_url && (
                  <div className="mt-2 rounded-xl overflow-hidden h-40 bg-slate-100">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setForm(f => ({ ...f, is_published: !f.is_published }))}
                    className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${
                      form.is_published ? 'bg-[#E11D48]' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      form.is_published ? 'left-5' : 'left-0.5'
                    }`} />
                  </div>
                  <span className="text-sm text-slate-600 font-medium">
                    {form.is_published ? 'Publish immediately' : 'Save as draft'}
                  </span>
                </label>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setTab('posts'); resetForm(); }}
                    className="px-5 py-2.5 text-sm text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all border border-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !form.title}
                    className="px-6 py-2.5 text-sm font-semibold bg-[#E11D48] hover:bg-[#be123c] disabled:opacity-50 text-white rounded-xl transition-all shadow-sm"
                  >
                    {saving ? 'Saving...' : editId ? 'Update Post' : 'Publish Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}