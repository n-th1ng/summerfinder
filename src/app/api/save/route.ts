import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getOrCreateSessionId, createSessionCookie } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { activityId?: string };
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON');
  }
  if (!body.activityId) return fail('activityId required');

  const exists = await prisma.activity.findUnique({ where: { id: body.activityId } });
  if (!exists) return fail('Activity not found', 404);

  const sessionId = getOrCreateSessionId();
  createSessionCookie(sessionId);

  const saved = await prisma.savedItem.upsert({
    where: { sessionId_activityId: { sessionId, activityId: body.activityId } },
    create: { sessionId, activityId: body.activityId },
    update: {},
  });

  await prisma.usageEvent.create({
    data: { kind: 'save', sessionId, payload: JSON.stringify({ activityId: body.activityId }) },
  });

  return ok({ saved: true, id: saved.id });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const activityId = url.searchParams.get('activityId');
  if (!activityId) return fail('activityId required');

  const sessionId = getOrCreateSessionId();
  createSessionCookie(sessionId);
  await prisma.savedItem.deleteMany({ where: { sessionId, activityId } });
  return ok({ saved: false });
}