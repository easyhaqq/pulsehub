'use client';
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface SeoPanelProps {
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  customSlug: string;
  content: string;
  excerpt: string;
  onChange: (field: string, value: string) => void;
}

export default function SeoPanel({
  title, metaTitle, metaDescription, focusKeyword,
  customSlug, content, excerpt, onChange
}: SeoPanelProps) {
  const [score, setScore] = useState(0);

  const checks = [
    {
      label: 'Keyword in title',
      pass: focusKeyword && title.toLowerCase().includes(focusKeyword.toLowerCase()),
    },
    {
      label: 'Keyword in meta description',
      pass: focusKeyword && metaDescription.toLowerCase().includes(focusKeyword.toLowerCase()),
    },
    {
      label: 'Keyword in first paragraph',
      pass: focusKeyword && content.substring(0, 500).toLowerCase().includes(focusKeyword.toLowerCase()),
    },
    {
      label: 'Meta description length (120-160 chars)',
      pass: metaDescription.length >= 120 && metaDescription.length <= 160,
    },
    {
      label: 'Meta title length (50-60 chars)',
      pass: (metaTitle || title).length >= 50 && (metaTitle || title).length <= 60,
    },
    {
      label: 'Custom slug set',
      pass: customSlug.length > 0,
    },
    {
      label: 'Content length (300+ words)',
      pass: content.split(/\s+/).filter(Boolean).length >= 300,
    },
    {
      label: 'Excerpt / meta description exists',
      pass: excerpt.length > 0 || metaDescription.length > 0,
    },
  ];

  useEffect(() => {
    const passed = checks.filter(c => c.pass).length;
    setScore(Math.round((passed / checks.length) * 100));
  }, [title, metaTitle, metaDescription, focusKeyword, customSlug, content, excerpt]);

  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-500';
  const scoreBg = score >= 80 ? 'bg-emerald-50 border-emerald-200' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:outline-none focus:border-[#E11D48] transition-colors bg-white';

  return (
    <div className="space-y-6">

      {/* SEO Score */}
      <div className={`rounded-xl p-4 border ${scoreBg}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-semibold text-slate-700 text-sm">SEO Score</span>
          <span className={`text-2xl font-extrabold ${scoreColor}`}>{score}%</span>
        </div>
        <div className="w-full bg-white rounded-full h-2 border border-slate-200">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-2">
          {score >= 80 ? '🟢 Great! Your article is well optimized.' :
           score >= 50 ? '🟡 Good, but room for improvement.' :
           '🔴 Needs work. Fill in the SEO fields below.'}
        </p>
      </div>

      {/* Checks */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-slate-700">SEO Checklist</h4>
        {checks.map((check, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            {check.pass
              ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />
              : <XCircle size={15} className="text-red-400 flex-shrink-0" />}
            <span className={check.pass ? 'text-slate-600' : 'text-slate-400'}>
              {check.label}
            </span>
          </div>
        ))}
      </div>

      {/* Focus Keyword */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Focus Keyword
        </label>
        <input
          className={inputCls}
          placeholder="e.g. Nigerian stock market"
          value={focusKeyword}
          onChange={e => onChange('focus_keyword', e.target.value)}
        />
        <p className="text-xs text-slate-400 mt-1">The main keyword this article should rank for</p>
      </div>

      {/* Meta Title */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Meta Title <span className="text-slate-400 font-normal">({(metaTitle || title).length}/60)</span>
        </label>
        <input
          className={inputCls}
          placeholder={title || 'Article title for Google...'}
          value={metaTitle}
          onChange={e => onChange('meta_title', e.target.value)}
        />
        <div className="mt-1 w-full bg-slate-100 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all ${
              (metaTitle || title).length <= 60 ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, ((metaTitle || title).length / 60) * 100)}%` }}
          />
        </div>
      </div>

      {/* Meta Description */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Meta Description <span className="text-slate-400 font-normal">({metaDescription.length}/160)</span>
        </label>
        <textarea
          className={`${inputCls} resize-none`}
          rows={3}
          placeholder="What this article is about (shown in Google search results)..."
          value={metaDescription}
          onChange={e => onChange('meta_description', e.target.value)}
        />
        <div className="mt-1 w-full bg-slate-100 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all ${
              metaDescription.length >= 120 && metaDescription.length <= 160
                ? 'bg-emerald-500'
                : metaDescription.length > 160
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min(100, (metaDescription.length / 160) * 100)}%` }}
          />
        </div>
      </div>

      {/* Custom Slug */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Custom URL Slug</label>
        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:border-[#E11D48] transition-colors bg-white">
          <span className="px-3 py-3 bg-slate-50 text-slate-400 text-sm border-r border-slate-200 whitespace-nowrap">
            pulsehub.ng/news/
          </span>
          <input
            type="text"
            className="flex-1 px-3 py-3 text-sm outline-none text-slate-900"
            placeholder="your-article-slug"
            value={customSlug}
            onChange={e => onChange('custom_slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
          />
        </div>
      </div>

      {/* Google Preview */}
      <div>
        <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
          <AlertCircle size={14} className="text-blue-500" /> Google Preview
        </h4>
        <div className="border border-slate-200 rounded-xl p-4 bg-white">
          <p className="text-blue-600 text-sm font-medium line-clamp-1">
            {metaTitle || title || 'Article Title'}
          </p>
          <p className="text-green-700 text-xs mt-0.5">
            pulsehub.ng/news/{customSlug || 'article-slug'}
          </p>
          <p className="text-slate-500 text-xs mt-1 line-clamp-2">
            {metaDescription || excerpt || 'Meta description will appear here...'}
          </p>
        </div>
      </div>

    </div>
  );
}