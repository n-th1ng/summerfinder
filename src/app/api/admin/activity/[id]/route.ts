import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';

export const dynamic = 'force-dynamic';

function checkAdmin(req: Request) {
  const passcode = req.headers.get('x-admin-passcode');
  const expected = process.env.ADMIN_PASSCODE ?? 'letmein';
  return passcode === expected;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!checkAdmin(req)) return fail('Forbidden', 403);
  let body: any;
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON');
  }

  const data: any = {};
  for (const k of [
    'title',
    'description',
    'category',
    'locationType',
    'city',
    'timezone',
    'cost',
    'duration',
    'indoorOutdoor',
    'skillLevel',
    'sourceUrl',
    'providerName',
    'isActive',
    'isApproved',
  ]) {
    if (k in body) data[k] = body[k];
  }
  if ('ageMin' in body) data.ageMin = Number(body.ageMin);
  if ('ageMax' in body) data.ageMax = Number(body.ageMax);
  if ('tags' in body) data.tags = JSON.stringify(body.tags);

  const a = await prisma.activity.update({ where: { id: params.id }, data });
  return ok({ activity: a });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  if (!checkAdmin(req)) return fail('Forbidden', 403);
  await prisma.activity.delete({ where: { id: params.id } });
  return ok({ deleted: true });
}