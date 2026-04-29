import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { Post } from '../lib/api';

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function isValidUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function PlaceholderImage() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
      <span className="text-4xl opacity-20">📰</span>
    </div>
  );
}

export function FeaturedCard({ post }: { post: Post }) {
  const hasImage = isValidUrl(post.image_url);
  return (
    <Link href={`/news/${post.slug}`} className="group block">
      <article className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 card-hover">
        <div className="relative h-80 w-full bg-slate-100">
          {hasImage ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
            />
          ) : (
            <PlaceholderImage />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <span className="text-xs font-bold uppercase tracking-widest bg-[#E11D48] text-white px-2.5 py-1 rounded-full mb-3 inline-block">
              {post.category}
            </span>
            <h2 className="text-2xl font-bold text-white leading-tight group-hover:text-red-200 transition-colors line-clamp-2">
              {post.title}
            </h2>
            <div className="flex items-center gap-4 mt-3 text-white/70 text-xs">
              <span className="flex items-center gap-1"><Clock size={12} /> {timeAgo(post.created_at)}</span>
              <span className="flex items-center gap-1"><Eye size={12} /> {post.view_count?.toLocaleString()} views</span>
              <span>{post.author}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function GridCard({ post }: { post: Post }) {
  const hasImage = isValidUrl(post.image_url);
  return (
    <Link href={`/news/${post.slug}`} className="group block h-full">
      <article className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 card-hover h-full flex flex-col">
        <div className="relative h-48 bg-slate-100 flex-shrink-0">
          {hasImage ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <PlaceholderImage />
          )}
        </div>
        <div className="p-5 flex flex-col flex-1">
          <span className="category-badge mb-2">{post.category}</span>
          <h3 className="font-bold text-[#0F172A] text-base leading-snug mb-2 group-hover:text-[#E11D48] transition-colors line-clamp-2 flex-1">
            {post.title}
          </h3>
          <p className="text-slate-500 text-sm line-clamp-2 mb-4">{post.excerpt}</p>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-auto">
            <span className="flex items-center gap-1"><Clock size={11} /> {timeAgo(post.created_at)}</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {post.view_count?.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export function ListCard({ post }: { post: Post }) {
  const hasImage = isValidUrl(post.image_url);
  return (
    <Link href={`/news/${post.slug}`} className="group block">
      <article className="flex gap-4 bg-white rounded-xl p-4 border border-slate-100 card-hover">
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
          {hasImage ? (
            <Image src={post.image_url} alt={post.title} fill className="object-cover" sizes="96px" />
          ) : (
            <PlaceholderImage />
          )}
        </div>
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <span className="category-badge text-xs mb-1">{post.category}</span>
            <h3 className="font-semibold text-[#0F172A] text-sm leading-snug group-hover:text-[#E11D48] transition-colors line-clamp-2 mt-1">
              {post.title}
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Clock size={10} /> {timeAgo(post.created_at)}</span>
            <span className="flex items-center gap-1"><Eye size={10} /> {post.view_count?.toLocaleString()}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}