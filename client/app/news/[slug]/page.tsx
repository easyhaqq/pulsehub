import ShareButton from '../../../components/ShareButton';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, ArrowLeft } from 'lucide-react';

type Props = { params: { slug: string } };

async function getPost(slug: string) {
  try {
    const res = await fetch(`http://127.0.0.1:5005/api/posts/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Dynamic SEO metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Article Not Found' };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image_url ? [{ url: post.image_url }] : [],
      type: 'article',
      publishedTime: post.created_at,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.image_url ? [post.image_url] : [],
    },
  };
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString('en-US', { dateStyle: 'long' });
}

// SSR — rendered on server for Google crawlers
export default async function ArticlePage({ params }: Props) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  return (
    <div className="bg-ghost min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#E11D48] transition-colors mb-8 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to stories
        </Link>

        <article>
          {/* Category + meta */}
          <div className="mb-4">
            <Link
              href={`/category/${post.category?.toLowerCase()}`}
              className="category-badge"
            >
              {post.category}
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] leading-tight mb-4">
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-slate-500 font-light leading-relaxed mb-6 border-l-4 border-[#E11D48] pl-4">
              {post.excerpt}
            </p>
          )}

          {/* Meta bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-200 mb-8">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="font-semibold text-[#0F172A]">{post.author}</span>
              <span className="flex items-center gap-1"><Clock size={14} /> {timeAgo(post.created_at)}</span>
              <span className="flex items-center gap-1"><Eye size={14} /> {post.view_count?.toLocaleString()} views</span>
            </div>
            <ShareButton title={post.title} />
          </div>

          {/* Hero image */}
          {post.image_url && (
            <div className="relative w-full h-72 sm:h-96 rounded-2xl overflow-hidden mb-8 bg-slate-100">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose-article">
            {post.content?.split('\n').map((paragraph: string, i: number) =>
              paragraph.trim() ? <p key={i}>{paragraph}</p> : null
            )}
          </div>
        </article>

        {/* Article footer */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">Written by</p>
              <p className="font-bold text-[#0F172A]">{post.author}</p>
            </div>
            <Link href="/" className="btn-primary">
              More Stories →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}