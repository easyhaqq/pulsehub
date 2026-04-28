import type { Metadata } from 'next';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: { default: 'PulseHub — Breaking News & Media', template: '%s | PulseHub' },
  description: 'Fast, accurate, and trusted news coverage on tech, business, entertainment and more.',
  openGraph: {
    siteName: 'PulseHub',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-ghost flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}