import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

const COOKIE_NAME = 'sf_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

export function getOrCreateSessionId(): string {
  const jar = cookies();
  const existing = jar.get(COOKIE_NAME);
  if (existing?.value) return existing.value;
  const id = randomBytes(16).toString('hex');
  jar.set(COOKIE_NAME, id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
  return id;
}

export function getSessionId(): string | undefined {
  return cookies().get(COOKIE_NAME)?.value;
}