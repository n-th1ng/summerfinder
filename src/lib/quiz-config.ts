/**
 * Quiz configuration — drives the clickable quiz UI.
 * Every option is a button; no text inputs for the user.
 * All IDs are stable so analytics and recommendations can match.
 */

export type QuizOption = {
  id: string;
  label: string;
  emoji: string;
  description?: string;
};

export type QuizQuestion = {
  id:
    | 'ageGroup'
    | 'location'
    | 'timeCommitment'
    | 'budget'
    | 'preference'
    | 'mood'
    | 'interests'
    | 'skillLevel';
  title: string;
  subtitle?: string;
  helper?: string;
  multi?: boolean;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'ageGroup',
    title: 'How old are you?',
    subtitle: 'We use this to show activities that are right for your age.',
    options: [
      { id: '10-12', label: '10–12', emoji: '🧒' },
      { id: '12-14', label: '12–14', emoji: '🧑' },
      { id: '14-16', label: '14–16', emoji: '🎒' },
      { id: '16-18', label: '16–18', emoji: '🧑‍🎓' },
    ],
  },
  {
    id: 'location',
    title: 'Where are you?',
    subtitle: 'We use your city or area only to find activities nearby.',
    options: [
      { id: 'near_me', label: 'Near me', emoji: '📍', description: 'Use my city if I shared it' },
      { id: 'anywhere', label: 'Anywhere online', emoji: '🌐', description: 'Online or remote is fine' },
      { id: 'us', label: 'United States', emoji: '🇺🇸' },
      { id: 'uk', label: 'United Kingdom', emoji: '🇬🇧' },
      { id: 'ca', label: 'Canada', emoji: '🇨🇦' },
      { id: 'in', label: 'India', emoji: '🇮🇳' },
      { id: 'au', label: 'Australia', emoji: '🇦🇺' },
    ],
  },
  {
    id: 'timeCommitment',
    title: 'How much time do you have?',
    subtitle: 'Pick the closest match — you can change this later.',
    options: [
      { id: '30min', label: '30 min', emoji: '⏱️' },
      { id: '1-2hr', label: '1–2 hrs', emoji: '🕐' },
      { id: 'half-day', label: 'Half day', emoji: '🌤️' },
      { id: 'multi-day', label: 'Multi-day', emoji: '📅' },
      { id: 'ongoing', label: 'Ongoing', emoji: '🔁' },
    ],
  },
  {
    id: 'budget',
    title: 'What is your budget?',
    options: [
      { id: 'free', label: 'Free', emoji: '🪙' },
      { id: 'low', label: 'Low cost', emoji: '💸' },
      { id: 'paid', label: 'Paid is fine', emoji: '💳' },
    ],
  },
  {
    id: 'preference',
    title: 'Indoor, outdoor, or both?',
    options: [
      { id: 'indoor', label: 'Indoor', emoji: '🏠' },
      { id: 'outdoor', label: 'Outdoor', emoji: '🌳' },
      { id: 'both', label: 'Both', emoji: '🔀' },
    ],
  },
  {
    id: 'mood',
    title: 'What kind of vibe?',
    options: [
      { id: 'active', label: 'Active', emoji: '🏃' },
      { id: 'creative', label: 'Creative', emoji: '🎨' },
      { id: 'academic', label: 'Academic', emoji: '📚' },
      { id: 'social', label: 'Social', emoji: '🫂' },
      { id: 'relaxing', label: 'Relaxing', emoji: '😌' },
    ],
  },
  {
    id: 'interests',
    title: 'Pick your interests',
    subtitle: 'Tap as many as you like — at least one.',
    multi: true,
    options: [
      { id: 'sports', label: 'Sports', emoji: '⚽' },
      { id: 'coding', label: 'Coding', emoji: '💻' },
      { id: 'art', label: 'Art', emoji: '🖌️' },
      { id: 'reading', label: 'Reading', emoji: '📖' },
      { id: 'business', label: 'Business', emoji: '💼' },
      { id: 'volunteering', label: 'Volunteering', emoji: '🤝' },
      { id: 'gaming', label: 'Gaming', emoji: '🎮' },
      { id: 'fitness', label: 'Fitness', emoji: '💪' },
      { id: 'music', label: 'Music', emoji: '🎵' },
      { id: 'science', label: 'Science', emoji: '🔬' },
      { id: 'clubs', label: 'Clubs', emoji: '🧩' },
      { id: 'courses', label: 'Courses', emoji: '🎓' },
    ],
  },
  {
    id: 'skillLevel',
    title: 'How would you describe yourself?',
    options: [
      { id: 'beginner', label: 'Beginner', emoji: '🌱' },
      { id: 'intermediate', label: 'Intermediate', emoji: '🌿' },
      { id: 'advanced', label: 'Advanced', emoji: '🌳' },
    ],
  },
];

export type QuizAnswers = {
  ageGroup?: string;
  location?: string;
  timeCommitment?: string;
  budget?: string;
  preference?: string;
  mood?: string;
  interests?: string[];
  skillLevel?: string;
};

export function isQuizComplete(a: QuizAnswers): boolean {
  return Boolean(
    a.ageGroup &&
      a.location &&
      a.timeCommitment &&
      a.budget &&
      a.preference &&
      a.mood &&
      a.skillLevel &&
      a.interests &&
      a.interests.length > 0,
  );
}