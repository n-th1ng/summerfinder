/**
 * Lightweight rule-based "agent" that interprets free-text queries
 * (e.g. "something free I can do today outdoors") against the activity
 * catalog using the same scoring engine.
 *
 * It returns:
 *   - a short natural-language reply (the agent's voice)
 *   - up to N ranked activity cards
 *
 * The agent is intentionally deterministic and privacy-respecting:
 *   - never asks for or stores personal info
 *   - never makes network calls beyond the local catalog
 *   - safe-by-default (refuses anything that asks it to bypass the quiz)
 *
 * Designed so an LLM layer can be dropped in later by replacing
 * `interpretQuery` with a model call while keeping the same shape.
 */

import type { QuizAnswers } from './quiz-config';
import { rankActivities, type ScoredActivity } from './scoring';

export type AgentInput = {
  query: string;
  baseAnswers?: QuizAnswers;
  userCity?: string;
};

export type AgentResponse = {
  reply: string;
  intent: string;
  answers: QuizAnswers;
  results: ScoredActivity[];
};

const INTENT_KEYWORDS: Array<{ intent: string; matches: RegExp[] }> = [
  { intent: 'free', matches: [/\bfree\b/i, /no\s*cost/i, /cheap/i] },
  { intent: 'low-cost', matches: [/low\s*cost/i, /budget/i, /affordable/i] },
  { intent: 'paid', matches: [/\bpaid\b/i, /willing to (pay|spend)/i] },
  { intent: 'outdoor', matches: [/outdoor/i, /outside/i, /\bpark\b/i, /\bhike\b/i, /\bbeach\b/i, /\bgarden\b/i] },
  { intent: 'indoor', matches: [/indoor/i, /inside/i, /at home/i, /from home/i, /my room/i] },
  { intent: 'short', matches: [/\b30\b.*\bmin/i, /\bquick\b/i, /\bshort\b/i, /few hours/i, /tonight/i, /today/i] },
  { intent: 'half-day', matches: [/half\s*day/i, /afternoon/i, /morning/i] },
  { intent: 'multi-day', matches: [/multi\s*day/i, /\bweek\b/i, /camp/i, /\bcourse\b/i] },
  { intent: 'ongoing', matches: [/ongoing/i, /\bsummer\b/i, /whole summer/i, /for weeks/i] },
  { intent: 'active', matches: [/active/i, /\bworkout\b/i, /\brun\b/i, /\bsport/i, /\bfitness\b/i, /\bgym\b/i, /\byoga\b/i] },
  { intent: 'creative', matches: [/creativ/i, /\bart\b/i, /\bdraw\b/i, /\bpaint\b/i, /\bmusic\b/i, /\bpiano\b/i, /\bguitar\b/i] },
  { intent: 'academic', matches: [/academic/i, /\bstudy\b/i, /\bscience\b/i, /\bmath\b/i, /\blearn\b/i, /\bread\b/i] },
  { intent: 'social', matches: [/social/i, /\bfriend/i, /\bteam\b/i, /\bclub\b/i, /\bgroup\b/i] },
  { intent: 'relaxing', matches: [/relax/i, /\bchill\b/i, /\bcalm\b/i, /calm down/i] },
];

function detectIntent(query: string): string[] {
  const found = new Set<string>();
  for (const k of INTENT_KEYWORDS) {
    if (k.matches.some((re) => re.test(query))) found.add(k.intent);
  }
  return Array.from(found);
}

function answersFromIntent(intents: string[], base?: QuizAnswers): QuizAnswers {
  const a: QuizAnswers = { ...(base ?? {}) };
  // Only fill defaults when the user hasn't already answered in the quiz.
  if (!a.budget && intents.includes('free')) a.budget = 'free';
  else if (!a.budget && intents.includes('low-cost')) a.budget = 'low';
  else if (!a.budget && intents.includes('paid')) a.budget = 'paid';

  if (!a.preference && intents.includes('outdoor')) a.preference = 'outdoor';
  else if (!a.preference && intents.includes('indoor')) a.preference = 'indoor';
  else if (!a.preference && (intents.includes('outdoor') || intents.includes('indoor'))) a.preference = 'both';

  if (!a.timeCommitment && intents.includes('short')) a.timeCommitment = '30min';
  else if (!a.timeCommitment && intents.includes('half-day')) a.timeCommitment = 'half-day';
  else if (!a.timeCommitment && intents.includes('multi-day')) a.timeCommitment = 'multi-day';
  else if (!a.timeCommitment && intents.includes('ongoing')) a.timeCommitment = 'ongoing';

  if (!a.mood && intents.includes('active')) a.mood = 'active';
  else if (!a.mood && intents.includes('creative')) a.mood = 'creative';
  else if (!a.mood && intents.includes('academic')) a.mood = 'academic';
  else if (!a.mood && intents.includes('social')) a.mood = 'social';
  else if (!a.mood && intents.includes('relaxing')) a.mood = 'relaxing';

  // Always ensure interests and skill have *something* so scoring works.
  if (!a.interests || a.interests.length === 0) a.interests = ['sports', 'art', 'science'];
  if (!a.skillLevel) a.skillLevel = 'beginner';

  return a;
}

function makeReply(intents: string[], count: number): string {
  const tags: string[] = [];
  if (intents.includes('free')) tags.push('free');
  if (intents.includes('outdoor')) tags.push('outdoor');
  if (intents.includes('indoor')) tags.push('indoor');
  if (intents.includes('short')) tags.push('quick');
  if (intents.includes('active')) tags.push('active');
  if (intents.includes('creative')) tags.push('creative');
  if (intents.includes('academic')) tags.push('learning-focused');
  if (intents.includes('social')) tags.push('social');
  if (intents.includes('relaxing')) tags.push('chill');

  if (tags.length === 0) {
    return `Here are ${count} things you might enjoy this summer. Want me to narrow it down — free stuff, outdoors, or something creative?`;
  }
  return `Based on what you said, I picked ${count} ${tags.join(' / ')} ${tags.length === 1 ? 'pick' : 'picks'} for you.`;
}

const REFUSAL_PATTERNS: RegExp[] = [
  /\b(hack|exploit|bypass)\b/i,
  /\b(pretend|lie|trick)\b/i,
  /\b(password|credit card|ssn|social security)\b/i,
];

export function isUnsafeQuery(q: string): boolean {
  return REFUSAL_PATTERNS.some((re) => re.test(q));
}

export async function runAgent(
  input: AgentInput,
  activities: ScoredActivity[],
): Promise<AgentResponse> {
  const trimmed = (input.query ?? '').trim();
  if (!trimmed) {
    return {
      reply: 'Tell me what kind of summer thing you’re looking for — free, outdoors, quick, creative, whatever!',
      intent: 'empty',
      answers: input.baseAnswers ?? {},
      results: activities.slice(0, 3),
    };
  }

  if (isUnsafeQuery(trimmed)) {
    return {
      reply:
        "I can't help with that. I'm just here to suggest fun summer things to do. Try asking for something free, outdoors, or creative!",
      intent: 'refused',
      answers: input.baseAnswers ?? {},
      results: [],
    };
  }

  const intents = detectIntent(trimmed);
  const answers = answersFromIntent(intents, input.baseAnswers);

  const ranked = rankActivities(activities, answers, input.userCity).slice(0, 6);
  return {
    reply: makeReply(intents, ranked.length),
    intent: intents.join(',') || 'explore',
    answers,
    results: ranked,
  };
}