import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const a = await prisma.activity.findUnique({ where: { id: params.id } });
  if (!a || !a.isActive || !a.isApproved) return fail('Not found', 404);

  const sessionId = getOrCreateSessionId();
  await prisma.usageEvent.create({
    data: { kind: 'detail_view', sessionId, payload: JSON.stringify({ activityId: a.id }) },
  });

  return ok({
    activity: {
      ...a,
      tags: JSON.parse(a.tags) as string[],
    },
  });
}