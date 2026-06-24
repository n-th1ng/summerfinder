import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';

function checkAdmin(req: Request) {
  const passcode = req.headers.get('x-admin-passcode');
  const expected = process.env.ADMIN_PASSCODE ?? 'letmein';
  return passcode === expected;
}

export async function GET() {
  const [total, approved, pending, saves, quizzes, events] = await Promise.all([
    prisma.activity.count(),
    prisma.activity.count({ where: { isApproved: true, isActive: true } }),
    prisma.adminSubmission.count({ where: { status: 'pending' } }),
    prisma.savedItem.count(),
    prisma.quizResponse.count(),
    prisma.usageEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
  ]);

  const tagAgg = await prisma.quizResponse.findMany({ select: { interests: true } });
  const tagCounts: Record<string, number> = {};
  for (const r of tagAgg) {
    try {
      const interests = JSON.parse(r.interests) as string[];
      for (const i of interests) tagCounts[i] = (tagCounts[i] ?? 0) + 1;
    } catch {}
  }
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const savedCounts = await prisma.savedItem.groupBy({
    by: ['activityId'],
    _count: { activityId: true },
    orderBy: { _count: { activityId: 'desc' } },
    take: 5,
  });
  const topSaved = await Promise.all(
    savedCounts.map(async (s) => {
      const a = await prisma.activity.findUnique({ where: { id: s.activityId } });
      return { id: s.activityId, title: a?.title, count: s._count.activityId };
    }),
  );

  return ok({
    stats: { total, approved, pending, saves, quizzes },
    topTags,
    topSaved,
    recentEvents: events,
  });
}

export async function POST(req: Request) {
  if (!checkAdmin(req)) return fail('Forbidden', 403);
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON');
  }
  if (!body.title || !body.description || !body.category) {
    return fail('Missing fields');
  }
  const a = await prisma.activity.create({
    data: {
      title: body.title,
      description: body.description,
      category: body.category,
      ageMin: Number(body.ageMin ?? 10),
      ageMax: Number(body.ageMax ?? 18),
      locationType: body.locationType ?? 'global',
      city: body.city ?? null,
      timezone: body.timezone ?? null,
      cost: body.cost ?? 'free',
      duration: body.duration ?? 'ongoing',
      indoorOutdoor: body.indoorOutdoor ?? 'both',
      skillLevel: body.skillLevel ?? 'any',
      tags: JSON.stringify(body.tags ?? []),
      sourceUrl: body.sourceUrl ?? null,
      providerName: body.providerName ?? null,
      isActive: true,
      isApproved: true,
    },
  });
  return ok({ activity: a });
}