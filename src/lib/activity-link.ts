/**
 * Smart link generation for activities.
 *
 * - For global activities with a sourceUrl (e.g. Khan Academy, itch.io),
 *   return the sourceUrl so users land directly on the resource.
 * - For local activities (city-specific like "Volunteer at an Animal Shelter
 *   in Austin") or activities without a sourceUrl, return a Google search
 *   URL pre-populated with the activity title + "near me" or the city.
 *
 * This way, when a user clicks an activity, they get something useful:
 * either the resource directly, or a search to find it in their area.
 */

import type { ScoredActivity } from './scoring';

type Resolved = {
  sourceUrl: string | null | undefined;
  title: string;
  category: string;
  city: string | null | undefined;
  locationType: string;
  tags?: string[];
  providerName?: string | null;
};

const CATEGORY_TO_QUERY: Record<string, string> = {
  course: 'course',
  sport: 'sports league',
  academic: 'academic program',
  hobby: 'class',
  outdoor: 'outdoor activity',
  volunteer: 'volunteer',
  event: 'event',
  self_study: 'self-study',
  club: 'club',
  boredom_buster: 'activity',
};

// Strip filler words so the search query reads naturally.
function titleToQuery(title: string): string {
  return title
    .replace(/\(.*?\)/g, '')
    .replace(/—.*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLikelyGlobal(activity: Resolved): boolean {
  if (activity.locationType === 'global') return true;
  if (activity.locationType === 'national' && !activity.city) return true;
  return false;
}

export function getActivityLink(activity: Resolved): {
  url: string;
  label: string;
  isSearch: boolean;
} {
  // 1. If the activity is global AND has a direct sourceUrl, use it.
  if (isLikelyGlobal(activity) && activity.sourceUrl) {
    return {
      url: activity.sourceUrl,
      label: activity.providerName
        ? `Open ${activity.providerName}`
        : 'Open source',
      isSearch: false,
    };
  }

  // 2. Otherwise, build a Google search query.
  const baseTitle = titleToQuery(activity.title);
  // Drop category term if it's already in the title (e.g. "Volunteer" in
  // "Volunteer at an Animal Shelter") to avoid stuttering queries.
  const cat = CATEGORY_TO_QUERY[activity.category] ?? '';
  const catAlreadyInTitle =
    cat && baseTitle.toLowerCase().includes(cat.split(' ')[0].toLowerCase());
  const base = catAlreadyInTitle
    ? baseTitle
    : `${baseTitle} ${cat}`.trim();

  let query: string;
  query = `${base} near me`;

  return {
    url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    label: 'Search Google',
    isSearch: true,
  };
}