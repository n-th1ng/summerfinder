// Shared helpers for the static seed catalog. The same id is used
// everywhere so the activity detail page can look up an activity from
// the seed by its id.

import { SEED_ACTIVITIES, type SeedActivity } from './seed-data';

export function seedActivityId(a: SeedActivity): string {
  return `seed-${a.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)}`;
}

export function seedActivityById(id: string): SeedActivity | undefined {
  return SEED_ACTIVITIES.find((s) => seedActivityId(s) === id);
}

export function toResolvedSeed(a: SeedActivity) {
  return {
    id: seedActivityId(a),
    title: a.title,
    description: a.description,
    category: a.category,
    ageMin: a.ageMin,
    ageMax: a.ageMax,
    locationType: a.locationType as any,
    city: a.city ?? null,
    cost: a.cost as any,
    duration: a.duration as any,
    indoorOutdoor: a.indoorOutdoor as any,
    skillLevel: a.skillLevel as any,
    tags: a.tags,
    sourceUrl: a.sourceUrl ?? null,
    providerName: a.providerName ?? null,
  };
}