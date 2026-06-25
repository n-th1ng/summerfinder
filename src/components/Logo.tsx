import Link from 'next/link';

export function Logo({ size = 32, withWordmark = true }: { size?: number; withWordmark?: boolean }) {
  const inner = (
    <span
      className="relative inline-flex items-center justify-center rounded-2xl shadow-soft overflow-hidden"
      style={{ width: size, height: size }}
    >
      <span
        className="absolute inset-0"
        style={{
          background:
            'conic-gradient(from 140deg, #ff5b2e 0deg, #facc15 100deg, #33aaff 200deg, #9cf200 280deg, #ff5b2e 360deg)',
        }}
      />
      <span className="relative bg-white dark:bg-ink-900 rounded-[10px] m-[3px] flex items-center justify-center w-[calc(100%-6px)] h-[calc(100%-6px)]">
        <svg
          viewBox="0 0 24 24"
          width={size * 0.55}
          height={size * 0.55}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-coral-500"
          aria-hidden
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
        </svg>
      </span>
    </span>
  );

  if (!withWordmark) return inner;

  return (
    <Link href="/" className="flex items-center gap-2.5 font-bold text-[17px] tracking-tight">
      {inner}
      <span>SummerFinder</span>
    </Link>
  );
}