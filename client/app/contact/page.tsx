'use client';
import { useState } from 'react';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <span className="category-badge mb-4 inline-block">Contact</span>
      <h1 className="text-4xl font-extrabold text-[#0F172A] mb-2">Contact Us</h1>
      <p className="text-slate-500 mb-8">Have a tip or feedback? We'd love to hear from you.</p>
      {sent ? (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-8 text-center">
          <p className="text-2xl mb-2">✓</p>
          <p className="font-semibold">Message sent! We'll get back to you soon.</p>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setSent(true); }}>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input required className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#E11D48] text-sm" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input required type="email" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#E11D48] text-sm" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea required rows={5} className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:border-[#E11D48] text-sm resize-none" placeholder="Your message..." />
          </div>
          <button type="submit" className="btn-primary w-full py-3">Send Message →</button>
        </form>
      )}
    </div>
  );
}