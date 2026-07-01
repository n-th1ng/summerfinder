import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const COOKIE_NAME = 'sf_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export function getOrCreateSessionId(): string {
  const jar = cookies();
  const existing = jar.get(COOKIE_NAME);
  if (existing?.value) return existing.value;
  // We can't set cookies during static rendering or in Server Components
  // (Next.js throws "Cookies can only be modified in a Server Action or
  // Route Handler"). Generate a transient id here; it'll be persisted the
  // first time a Route Handler runs (e.g. POST /api/save).
  return randomBytes(16).toString('hex');
}

export function createSessionCookie(id: string) {
  cookies().set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

export function getSessionId(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}