import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Logo } from '@/components/Logo';
import { Icon } from '@/components/Icon';

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
    { media: '(prefers-color-scheme: light)', color: '#FFFCF8' },
    { media: '(prefers-color-scheme: dark)', color: '#09090D' },
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
      <body className="min-h-screen flex flex-col antialiased">
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
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-ink-950/70 border-b border-ink-100 dark:border-ink-800">
      <nav className="container h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-1.5">
          <NavLink href="/saved" icon="bookmark">Saved</NavLink>
          <NavLink href="/submit" icon="plusCircle" className="hidden sm:inline-flex">Submit</NavLink>
          <NavLink href="/admin" icon="shield" className="hidden md:inline-flex">Admin</NavLink>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  icon,
  children,
  className = '',
}: {
  href: string;
  icon: 'bookmark' | 'plusCircle' | 'shield';
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-sm font-semibold text-ink-700 hover:bg-ink-100 transition dark:text-ink-200 dark:hover:bg-ink-800 ${className}`}
    >
      <Icon name={icon} size={15} />
      <span>{children}</span>
    </Link>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-ink-100 dark:border-ink-800 mt-20 bg-ink-50/50 dark:bg-ink-900/40">
      <div className="container py-12">
        <div className="grid sm:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-3 text-sm text-ink-600 dark:text-ink-400 max-w-xs">
              A 60-second quiz that recommends summer activities for students.
              Privacy-first, made for ages 10–18.
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-500 mb-3">Product</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/quiz" className="text-ink-700 dark:text-ink-200 hover:underline">Take the quiz</Link></li>
              <li><Link href="/bored" className="text-ink-700 dark:text-ink-200 hover:underline">I'm bored</Link></li>
              <li><Link href="/saved" className="text-ink-700 dark:text-ink-200 hover:underline">Saved activities</Link></li>
              <li><Link href="/agent" className="text-ink-700 dark:text-ink-200 hover:underline">Ask the agent</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-500 mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              <li><Link href="/submit" className="text-ink-700 dark:text-ink-200 hover:underline">Submit an activity</Link></li>
              <li><Link href="/privacy" className="text-ink-700 dark:text-ink-200 hover:underline">Privacy</Link></li>
              <li><Link href="/terms" className="text-ink-700 dark:text-ink-200 hover:underline">Terms</Link></li>
              <li><Link href="/admin" className="text-ink-700 dark:text-ink-200 hover:underline">Admin</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-ink-100 dark:border-ink-800 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
          <p>© {new Date().getFullYear()} SummerFinder. Built with care.</p>
          <p className="inline-flex items-center gap-1.5"><Icon name="shield" size={12} /> Privacy-first by design</p>
        </div>
      </div>
    </footer>
  );
}