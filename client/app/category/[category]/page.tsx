'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, Post } from '../../../lib/api';
import { GridCard } from '../../../components/ArticleCard';

export default function CategoryPage() {
  const { category } = useParams<{ category: string }>();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category) {
      api.getCategory(category)
        .then(d => setPosts(d.posts))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [category]);

  const label = category.charAt(0).toUpperCase() + category.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <span className="category-badge text-sm mb-2 inline-block">{label}</span>
        <h1 className="text-3xl font-extrabold text-[#0F172A]">{label} News</h1>
        <p className="text-slate-500 mt-1">Latest stories from the {label} category</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-72 bg-slate-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-4xl mb-4">📂</p>
          <p className="text-lg">No stories in {label} yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => <GridCard key={post.id} post={post} />)}
        </div>
      )}
    </div>
  );
}