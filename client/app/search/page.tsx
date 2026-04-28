'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { api, Post } from '../../lib/api';
import { GridCard } from '../../components/ArticleCard';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    fetch(`/api/posts/search?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setPosts(d.posts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Search size={20} className="text-[#E11D48]" />
          <h1 className="text-2xl font-extrabold text-[#0F172A]">
            Search Results
          </h1>
        </div>
        <p className="text-slate-500">
          {loading ? 'Searching...' : `${posts.length} result${posts.length !== 1 ? 's' : ''} for `}
          {!loading && <span className="font-semibold text-[#0F172A]">"{q}"</span>}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-72 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 && q ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🔍</p>
          <p className="text-xl font-semibold text-slate-700">No results found</p>
          <p className="text-slate-400 mt-2">Try a different search term</p>
          <Link href="/" className="mt-6 inline-block btn-primary">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => <GridCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}