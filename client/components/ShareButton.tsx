'use client';
import { Share2 } from 'lucide-react';

export default function ShareButton({ title }: { title: string }) {
  function handleShare() {
    if (navigator.share) {
      navigator.share({ title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
  }
  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#E11D48] transition-colors"
    >
      <Share2 size={14} /> Share
    </button>
  );
}