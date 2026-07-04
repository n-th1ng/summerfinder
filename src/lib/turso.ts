import { createClient, type Client } from '@libsql/client';

let client: Client | null = null;

export function getTursoClient(): Client | null {
  if (client) return client;

  const url = process.env.DATABASE_URL;
  if (!url || url.startsWith('file:')) return null;

  try {
    const authToken = url.includes('authToken=') ? url.split('authToken=')[1] : undefined;
    const cleanUrl = url.includes('?') ? url.split('?')[0] : url;

    client = createClient({ url: cleanUrl, authToken });
    return client;
  } catch {
    return null;
  }
}
