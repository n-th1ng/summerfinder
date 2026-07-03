/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import { SEED_ACTIVITIES } from '../src/lib/seed-data';

const prisma = new PrismaClient();

const TAGS = [
  { slug: 'sports', label: 'Sports', group: 'interest' },
  { slug: 'coding', label: 'Coding', group: 'interest' },
  { slug: 'art', label: 'Art', group: 'interest' },
  { slug: 'reading', label: 'Reading', group: 'interest' },
  { slug: 'business', label: 'Business', group: 'interest' },
  { slug: 'volunteering', label: 'Volunteering', group: 'interest' },
  { slug: 'gaming', label: 'Gaming', group: 'interest' },
  { slug: 'fitness', label: 'Fitness', group: 'interest' },
  { slug: 'music', label: 'Music', group: 'interest' },
  { slug: 'science', label: 'Science', group: 'interest' },
  { slug: 'clubs', label: 'Clubs', group: 'interest' },
  { slug: 'courses', label: 'Courses', group: 'interest' },
];

async function main() {
  console.log('Seeding tags\u2026');
  for (const t of TAGS) {
    await prisma.activityTag.upsert({
      where: { slug: t.slug },
      create: t,
      update: { label: t.label, group: t.group },
    });
  }

  console.log('Clearing existing activities\u2026');
  await prisma.savedItem.deleteMany({});
  await prisma.adminSubmission.deleteMany({});
  await prisma.activity.deleteMany({});

  console.log(`Seeding ${SEED_ACTIVITIES.length} activities\u2026`);
  for (const a of SEED_ACTIVITIES) {
    await prisma.activity.create({
      data: {
        title: a.title,
        description: a.description,
        category: a.category,
        ageMin: a.ageMin,
        ageMax: a.ageMax,
        locationType: a.locationType,
        city: a.city ?? null,
        timezone: null,
        cost: a.cost,
        duration: a.duration,
        indoorOutdoor: a.indoorOutdoor,
        skillLevel: a.skillLevel,
        tags: JSON.stringify(a.tags),
        sourceUrl: a.sourceUrl ?? null,
        providerName: a.providerName ?? null,
        isActive: true,
        isApproved: true,
      },
    });
  }

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());