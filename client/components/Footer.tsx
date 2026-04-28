'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Col 1: Brand */}
          <div>
            <div className="mb-4">
              <span className="text-2xl font-extrabold text-[#E11D48]">Pulse</span>
              <span className="text-2xl font-extrabold text-white">Hub</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Delivering breaking news and in-depth analysis you can trust. Fast, accurate, and always ahead of the curve.
            </p>
          </div>

          {/* Col 2: Explore */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              {['Latest News', 'Tech', 'Business', 'Entertainment', 'Sports'].map(item => (
                <li key={item}>
                  <Link
                    href={`/category/${item.toLowerCase().replace(' ', '-')}`}
                    className="hover:text-[#E11D48] transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Company */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
                { label: 'Contact Us', href: '/contact' },
                { label: 'Advertise', href: '/advertise' },
              ].map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Stay in the Pulse</h4>
            <p className="text-sm mb-4 text-slate-400">Get the top stories delivered to your inbox daily.</p>
            <form className="flex flex-col gap-2" onSubmit={e => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#E11D48] transition-colors"
              />
              <button
                type="submit"
                className="bg-[#E11D48] hover:bg-[#be123c] text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {`© ${new Date().getFullYear()} PulseHub. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-white transition-colors">Twitter</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-white transition-colors">Facebook</a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-white transition-colors">Instagram</a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-xs text-slate-500 hover:text-white transition-colors">YouTube</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
