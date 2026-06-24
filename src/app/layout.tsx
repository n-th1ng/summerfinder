import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export const metadata: Metadata = {
  title: 'SummerFinder — Bored this summer? Find something better to do.',
  description:
    'A 60-second quiz that recommends summer activities, courses, programs, sports, hobbies, and events for students ages 10–18.',
  applicationName: 'SummerFinder',
  authors: [{ name: 'SummerFinder' }],
  keywords: [
    'summer activities for students',
    'summer programs for teens',
    'summer camps',
    'teen summer ideas',
    'summer courses',
  ],
  openGraph: {
    title: 'SummerFinder',
    description: 'Bored this summer? Find something better to do.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fff7ed' },
    { media: '(prefers-color-scheme: dark)', color: '#0c0a09' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var saved = localStorage.getItem('sf-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <a className="skip-link" href="#main">Skip to content</a>
        <SiteHeader />
        <main id="main" className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-stone-950/70 border-b border-stone-200 dark:border-stone-800">
      <nav className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span aria-hidden className="text-2xl">☀️</span>
          <span>SummerFinder</span>
        </Link>
        <div className="flex items-center gap-1 text-sm">
          <Link href="/saved" className="touch rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800">Saved</Link>
          <Link href="/submit" className="touch rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800">Submit</Link>
          <Link href="/admin" className="hidden sm:inline-flex touch rounded-xl hover:bg-stone-100 dark:hover:bg-stone-800">Admin</Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 dark:border-stone-800 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-8 text-sm text-stone-600 dark:text-stone-400 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">SummerFinder</p>
          <p>Built for students ages 10–18. Privacy-first.</p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:underline">Privacy</Link>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <Link href="/submit" className="hover:underline">Submit an activity</Link>
          <Link href="/admin" className="hover:underline">Admin</Link>
        </div>
      </div>
    </footer>
  );
}