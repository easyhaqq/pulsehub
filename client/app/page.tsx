'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { TrendingUp, Flame } from 'lucide-react';
import { api, Post, FeedResponse } from '../lib/api';
import { FeaturedCard, GridCard, ListCard } from '../components/ArticleCard';

export default function HomePage() {
  const [feed, setFeed] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  const loadFeed = useCallback(async (cur?: string) => {
    try {
      const data: FeedResponse = await api.getFeed(cur);
      if (cur) {
        setFeed(prev => [...prev, ...data.posts]);
      } else {
        setFeed(data.posts);
      }
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadFeed().finally(() => setLoading(false));
  }, [loadFeed]);

  // Infinite scroll observer
  useEffect(() => {
    if (!loaderRef.current) return;
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && cursor) {
          setLoadingMore(true);
          loadFeed(cursor).finally(() => setLoadingMore(false));
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, cursor, loadFeed]);

  const featured = feed[0];
  const secondary = feed.slice(1, 4);
  const remaining = feed.slice(4);

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-slate-200 rounded-2xl animate-pulse" />
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-xl animate-pulse" />)}
        </div>
      </div>
    </div>
  );

  if (feed.length === 0) return (
    <div className="min-h-[60vh] flex items-center justify-center text-center px-4">
      <div>
        <p className="text-6xl mb-4">📰</p>
        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">No stories yet</h2>
        <p className="text-slate-500">Check back soon or publish from the admin panel.</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Top Feed: Featured + Sidebar */}
      {featured && (
        <section className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FeaturedCard post={featured} />
            </div>
            <aside className="flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame size={18} className="text-[#E11D48]" />
                <h2 className="font-bold text-[#0F172A] text-sm uppercase tracking-wider">Trending Now</h2>
              </div>
              {secondary.map(post => <ListCard key={post.id} post={post} />)}
            </aside>
          </div>
        </section>
      )}

      {/* Main Grid */}
      {remaining.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-[#E11D48]" />
            <h2 className="font-bold text-[#0F172A] text-sm uppercase tracking-wider">Latest Stories</h2>
            <div className="flex-1 h-px bg-slate-200 ml-2" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remaining.map(post => <GridCard key={post.id} post={post} />)}
          </div>
        </section>
      )}

      {/* Infinite scroll trigger */}
      <div ref={loaderRef} className="py-8 flex justify-center">
        {loadingMore && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <div className="w-4 h-4 border-2 border-[#E11D48] border-t-transparent rounded-full animate-spin" />
            Loading more stories...
          </div>
        )}
        {!hasMore && feed.length > 0 && (
          <p className="text-slate-400 text-sm">You&apos;re all caught up ✓</p>
        )}
      </div>
    </div>
  );
}