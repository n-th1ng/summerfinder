import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';
import { getOrCreateSessionId } from '@/lib/session';

export const dynamic = 'force-dynamic';

type Submission = {
  title: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  locationType: string;
  city?: string;
  cost: string;
  duration: string;
  indoorOutdoor: string;
  skillLevel: string;
  tags: string[];
  sourceUrl?: string;
  providerName?: string;
  submitterName: string;
  submitterLocation: string;
};

export async function POST(req: Request) {
  let body: Submission;
  try {
    body = await req.json();
  } catch {
    return fail('Invalid JSON');
  }
  if (!body.title || !body.description || !body.category) {
    return fail('Title, description and category are required');
  }
  if (!body.submitterName?.trim() || !body.submitterLocation?.trim()) {
    return fail('Please share your name and location so we can credit you.');
  }

  const sessionId = getOrCreateSessionId();

  const sub = await prisma.adminSubmission.create({
    data: {
      submitterName: body.submitterName.trim(),
      submitterLocation: body.submitterLocation.trim(),
      payload: JSON.stringify(body),
      status: 'pending',
    },
  });

  await prisma.usageEvent.create({
    data: { kind: 'submission', sessionId, payload: JSON.stringify({ id: sub.id }) },
  });

  return ok({ id: sub.id, status: sub.status });
}