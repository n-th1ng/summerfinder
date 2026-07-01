import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/Icon';

export default function NotFound() {
  return (
    <div className="container py-20 text-center max-w-xl mx-auto">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-coral-50 dark:bg-coral-500/15 text-coral-500 mb-5 animate-float">
        <Icon name="compass" size={36} />
      </div>
      <h1 className="text-display-lg">We couldn&apos;t find that.</h1>
      <p className="mt-3 text-ink-600 dark:text-ink-400">
        The activity or page may have been removed, or never existed.
      </p>
      <Link href="/" className="mt-6 inline-block">
        <Button size="lg" iconRight="arrowRight">Take me home</Button>
      </Link>
    </div>
  );
}