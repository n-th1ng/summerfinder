import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api';
import { getOrCreateSessionId, createSessionCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const sessionId = getOrCreateSessionId();
  createSessionCookie(sessionId);
  const items = await prisma.savedItem.findMany({
    where: { sessionId },
    include: { activity: true },
    orderBy: { createdAt: 'desc' },
  });

  return ok({
    items: items
      .filter((i) => i.activity && i.activity.isActive)
      .map((i) => ({
        id: i.id,
        savedAt: i.createdAt,
        activity: {
          ...i.activity,
          tags: JSON.parse(i.activity.tags) as string[],
        },
      })),
  });
}