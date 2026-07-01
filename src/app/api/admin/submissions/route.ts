import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';

function checkAdmin(req: Request) {
  const passcode = req.headers.get('x-admin-passcode');
  const expected = process.env.ADMIN_PASSCODE ?? 'letmein';
  return passcode === expected;
}

export async function GET(req: Request) {
  if (!checkAdmin(req)) return fail('Forbidden', 403);
  const subs = await prisma.adminSubmission.findMany({
    orderBy: { createdAt: 'desc' },
    include: { activity: true },
  });
  return ok({ submissions: subs });
}

export async function PATCH(req: Request) {
  if (!checkAdmin(req)) return fail('Forbidden', 403);
  let body: { id: string; status: 'approved' | 'rejected' | 'pending' };
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON');
  }
  if (!body.id || !body.status) return fail('id and status required');

  const sub = await prisma.adminSubmission.update({
    where: { id: body.id },
    data: { status: body.status, decidedAt: new Date() },
  });

  // Auto-create an approved activity when admin approves a submission.
  if (body.status === 'approved') {
    try {
      const payload = JSON.parse(sub.payload) as any;
      if (payload?.title && payload?.description) {
        await prisma.activity.create({
          data: {
            title: payload.title,
            description: payload.description,
            category: payload.category ?? 'hobby',
            ageMin: Number(payload.ageMin ?? 10),
            ageMax: Number(payload.ageMax ?? 18),
            locationType: payload.locationType ?? 'global',
            city: payload.city ?? sub.submitterLocation ?? null,
            timezone: null,
            cost: payload.cost ?? 'free',
            duration: payload.duration ?? 'ongoing',
            indoorOutdoor: payload.indoorOutdoor ?? 'both',
            skillLevel: payload.skillLevel ?? 'any',
            tags: JSON.stringify(payload.tags ?? []),
            sourceUrl: payload.sourceUrl ?? null,
            providerName: payload.providerName ?? null,
            isActive: true,
            isApproved: true,
          },
        });
      }
    } catch (e) {
      // ignore — submission stays approved even if auto-create fails
    }
  }

  return ok({ submission: sub });
}