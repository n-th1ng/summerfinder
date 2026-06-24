import type { QuizAnswers } from './quiz-config';

export type ScoredActivity = {
  id: string;
  title: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  locationType: string;
  city: string | null;
  cost: string;
  duration: string;
  indoorOutdoor: string;
  skillLevel: string;
  tags: string[];
  sourceUrl: string | null;
  providerName: string | null;
  score: number;          // 0..100
  reasons: string[];      // human-readable "why this matches"
};

const WEIGHTS = {
  age: 20,
  location: 15,
  time: 15,
  budget: 10,
  preference: 10,
  mood: 10,
  interest: 15,
  skill: 5,
};

function ageBucketToRange(bucket?: string): [number, number] {
  switch (bucket) {
    case '10-12':
      return [10, 12];
    case '12-14':
      return [12, 14];
    case '14-16':
      return [14, 16];
    case '16-18':
      return [16, 18];
    default:
      return [10, 18];
  }
}

function ageOverlapScore(activityMin: number, activityMax: number, bucket?: string): number {
  const [uMin, uMax] = ageBucketToRange(bucket);
  const overlap = Math.max(0, Math.min(uMax, activityMax) - Math.max(uMin, activityMin) + 1);
  const span = uMax - uMin + 1;
  return Math.min(1, overlap / span);
}

function locationScore(
  activity: { locationType: string; city: string | null },
  answer?: string,
  userCity?: string,
): number {
  if (!answer) return 0.5;
  if (answer === 'anywhere') {
    if (activity.locationType === 'global' || activity.locationType === 'online') return 1;
    if (activity.locationType === 'national') return 0.8;
    return 0.4;
  }
  if (answer === 'near_me') {
    if (activity.locationType === 'global' || activity.locationType === 'online') return 0.9;
    if (activity.locationType === 'national') return 0.7;
    if (activity.locationType === 'city') {
      if (!userCity) return 0.6;
      return activity.city && activity.city.toLowerCase() === userCity.toLowerCase() ? 1 : 0.3;
    }
    return 0.5;
  }
  // country code match
  const countryMap: Record<string, string> = {
    us: 'United States',
    uk: 'United Kingdom',
    ca: 'Canada',
    in: 'India',
    au: 'Australia',
  };
  const label = countryMap[answer] ?? answer;
  if (activity.locationType === 'global' || activity.locationType === 'online') return 0.9;
  if (activity.locationType === 'national' && activity.city && activity.city.toLowerCase().includes(label.toLowerCase())) return 1;
  if (activity.locationType === 'national') return 0.5;
  if (activity.locationType === 'city' && activity.city && activity.city.toLowerCase().includes(label.toLowerCase())) return 1;
  return 0.3;
}

function exactMatch(a?: string, b?: string): number {
  if (!a || !b) return 0;
  return a === b ? 1 : 0;
}

function durationScore(userDur?: string, actDur?: string): number {
  if (!userDur || !actDur) return 0.5;
  if (userDur === actDur) return 1;
  // soft fallbacks — accept nearby buckets
  const order = ['30min', '1-2hr', 'half-day', 'multi-day', 'ongoing'];
  const u = order.indexOf(userDur);
  const a = order.indexOf(actDur);
  if (u === -1 || a === -1) return 0.4;
  const dist = Math.abs(u - a);
  return Math.max(0, 1 - dist * 0.25);
}

function preferenceScore(userPref?: string, actPref?: string): number {
  if (!userPref || !actPref) return 0.5;
  if (userPref === 'both') return 0.8;
  if (actPref === 'both') return 0.9;
  return exactMatch(userPref, actPref);
}

function interestScore(userInterests: string[], actTags: string[]): number {
  if (userInterests.length === 0) return 0.4;
  const overlap = userInterests.filter((i) => actTags.includes(i)).length;
  return Math.min(1, overlap / Math.min(3, userInterests.length));
}

function moodScore(userMood?: string, actTags: string[] = []): number {
  if (!userMood) return 0.4;
  const moodTags: Record<string, string[]> = {
    active: ['sports', 'fitness'],
    creative: ['art', 'music'],
    academic: ['science', 'reading', 'courses', 'coding'],
    social: ['clubs', 'volunteering'],
    relaxing: ['reading', 'art', 'music'],
  };
  const tags = moodTags[userMood] ?? [];
  return tags.some((t) => actTags.includes(t)) ? 1 : 0.4;
}

function skillScore(userSkill?: string, actSkill?: string): number {
  if (!userSkill || !actSkill || actSkill === 'any') return 0.7;
  if (userSkill === actSkill) return 1;
  const order = ['beginner', 'intermediate', 'advanced'];
  const u = order.indexOf(userSkill);
  const a = order.indexOf(actSkill);
  if (u === -1 || a === -1) return 0.5;
  return Math.max(0, 1 - Math.abs(u - a) * 0.5);
}

export function scoreActivity(
  activity: {
    id: string;
    title: string;
    description: string;
    category: string;
    ageMin: number;
    ageMax: number;
    locationType: string;
    city: string | null;
    cost: string;
    duration: string;
    indoorOutdoor: string;
    skillLevel: string;
    tags: string[];
    sourceUrl: string | null;
    providerName: string | null;
  },
  answers: QuizAnswers,
  userCity?: string,
): ScoredActivity {
  const reasons: string[] = [];

  const age = ageOverlapScore(activity.ageMin, activity.ageMax, answers.ageGroup);
  if (age >= 0.99) reasons.push(`Great fit for ages ${activity.ageMin}–${activity.ageMax}`);

  const loc = locationScore(activity, answers.location, userCity);
  if (loc >= 0.9) reasons.push(activity.city ? `In ${activity.city}` : 'Available where you are');
  else if (answers.location === 'anywhere' && loc >= 0.8) reasons.push('Works from anywhere');

  const time = durationScore(answers.timeCommitment, activity.duration);
  if (time >= 0.9) reasons.push(`Matches your ${answers.timeCommitment} window`);

  const budget = exactMatch(answers.budget, activity.cost);
  if (budget === 1 && answers.budget) reasons.push(`${answers.budget === 'free' ? 'Free' : 'Fits your budget'}`);

  const pref = preferenceScore(answers.preference, activity.indoorOutdoor);
  if (pref >= 0.9) reasons.push(`${activity.indoorOutdoor === 'both' ? 'Indoor or outdoor' : `${activity.indoorOutdoor[0].toUpperCase()}${activity.indoorOutdoor.slice(1)} pick`}`);

  const interests = interestScore(answers.interests ?? [], activity.tags);
  if (interests >= 0.7) {
    const matched = (answers.interests ?? []).filter((i) => activity.tags.includes(i));
    if (matched.length) reasons.push(`Matches ${matched.slice(0, 2).join(' & ')}`);
  }

  const mood = moodScore(answers.mood, activity.tags);
  if (mood >= 0.9) reasons.push(`Matches your ${answers.mood} mood`);

  const skill = skillScore(answers.skillLevel, activity.skillLevel);
  if (skill >= 0.9) reasons.push(`Right level for ${answers.skillLevel}s`);

  const total =
    age * WEIGHTS.age +
    loc * WEIGHTS.location +
    time * WEIGHTS.time +
    budget * WEIGHTS.budget +
    pref * WEIGHTS.preference +
    mood * WEIGHTS.mood +
    interests * WEIGHTS.interest +
    skill * WEIGHTS.skill;

  return {
    ...activity,
    score: Math.round(total),
    reasons: reasons.slice(0, 3),
  };
}

export function rankActivities<T extends {
  id: string;
  title: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  locationType: string;
  city: string | null;
  cost: string;
  duration: string;
  indoorOutdoor: string;
  skillLevel: string;
  tags: string[];
  sourceUrl: string | null;
  providerName: string | null;
}>(activities: T[], answers: QuizAnswers, userCity?: string): ScoredActivity[] {
  return activities
    .map((a) => scoreActivity(a, answers, userCity))
    .sort((a, b) => b.score - a.score);
}

export const CATEGORY_LABELS: Record<string, string> = {
  course: 'Summer course',
  sport: 'Sport & fitness',
  academic: 'Academic program',
  hobby: 'Hobby & creative',
  outdoor: 'Outdoor activity',
  volunteer: 'Volunteering',
  event: 'Local event',
  self_study: 'Self-study plan',
  club: 'Club or competition',
  boredom_buster: 'Boredom buster',
};

export const COST_LABELS: Record<string, string> = {
  free: 'Free',
  low: 'Low cost',
  paid: 'Paid',
};

export const DURATION_LABELS: Record<string, string> = {
  '30min': '~30 min',
  '1-2hr': '1–2 hrs',
  'half-day': 'Half day',
  'multi-day': 'Multi-day',
  ongoing: 'Ongoing',
};

export const INDOOR_OUTDOOR_LABELS: Record<string, string> = {
  indoor: 'Indoor',
  outdoor: 'Outdoor',
  both: 'Indoor or outdoor',
};

export const SKILL_LABELS: Record<string, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  any: 'Any level',
};

export const LOCATION_LABELS: Record<string, string> = {
  global: 'Online / global',
  online: 'Online',
  national: 'National',
  city: 'Local',
  near_me: 'Near you',
};

export const INTEREST_LABELS: Record<string, { label: string; emoji: string }> = {
  sports: { label: 'Sports', emoji: '⚽' },
  coding: { label: 'Coding', emoji: '💻' },
  art: { label: 'Art', emoji: '🖌️' },
  reading: { label: 'Reading', emoji: '📖' },
  business: { label: 'Business', emoji: '💼' },
  volunteering: { label: 'Volunteering', emoji: '🤝' },
  gaming: { label: 'Gaming', emoji: '🎮' },
  fitness: { label: 'Fitness', emoji: '💪' },
  music: { label: 'Music', emoji: '🎵' },
  science: { label: 'Science', emoji: '🔬' },
  clubs: { label: 'Clubs', emoji: '🧩' },
  courses: { label: 'Courses', emoji: '🎓' },
};