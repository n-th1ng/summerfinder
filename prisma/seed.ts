/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Curated catalog of activities spanning every category.
// Cost: "free" | "low" | "paid" — Duration: "30min" | "1-2hr" | "half-day" | "multi-day" | "ongoing"
// IndoorOutdoor: "indoor" | "outdoor" | "both" — SkillLevel: "beginner" | "intermediate" | "advanced" | "any"
// Location: "global" | "national" | "city"

type Seed = {
  title: string;
  description: string;
  category: string;
  ageMin: number;
  ageMax: number;
  locationType: 'global' | 'national' | 'city';
  city?: string;
  cost: 'free' | 'low' | 'paid';
  duration: '30min' | '1-2hr' | 'half-day' | 'multi-day' | 'ongoing';
  indoorOutdoor: 'indoor' | 'outdoor' | 'both';
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'any';
  tags: string[];
  sourceUrl?: string;
  providerName?: string;
};

const SEED: Seed[] = [
  {
    title: 'Build Your First Website',
    description:
      'A self-paced, beginner-friendly coding track that walks you through HTML, CSS, and JavaScript by building a small personal site. Includes short videos, daily challenges, and a final project you can show friends.',
    category: 'course',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['coding', 'courses', 'science'],
    sourceUrl: 'https://www.khanacademy.org/computing',
    providerName: 'Khan Academy',
  },
  {
    title: 'Hour of Code: AI Edition',
    description:
      'A one-hour, no-setup intro to how modern AI works. Drag-and-drop puzzles, friendly explanations, and a certificate at the end.',
    category: 'course',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: '1-2hr',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['coding', 'science', 'courses'],
    sourceUrl: 'https://hourofcode.com',
    providerName: 'Hour of Code',
  },
  {
    title: 'Summer Soccer League',
    description:
      'Local recreational soccer with weekly games and practices. Co-ed divisions available for ages 10–14 and 14–18. Bring cleats and water.',
    category: 'sport',
    ageMin: 10,
    ageMax: 18,
    locationType: 'city',
    city: 'San Francisco',
    cost: 'low',
    duration: 'ongoing',
    indoorOutdoor: 'outdoor',
    skillLevel: 'any',
    tags: ['sports', 'fitness', 'clubs'],
    providerName: 'City Parks & Rec',
  },
  {
    title: 'Learn to Sketch in 5 Days',
    description:
      'A short, playful sketching course — pencils, paper, and your imagination. Build a habit of drawing something small every day.',
    category: 'hobby',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['art', 'courses'],
    sourceUrl: 'https://www.skillshare.com',
    providerName: 'Skillshare',
  },
  {
    title: 'Public Library Reading Challenge',
    description:
      'Most public libraries run a free summer reading program with bookmarks, prizes, and end-of-summer parties. Check your local branch.',
    category: 'event',
    ageMin: 10,
    ageMax: 18,
    locationType: 'city',
    city: 'New York',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'any',
    tags: ['reading', 'clubs'],
    providerName: 'Public Library',
  },
  {
    title: 'Trail Hike — Beginner Loop',
    description:
      'A 2-mile loop with shaded rest stops, perfect for first-time hikers. Bring water, sunscreen, and comfortable shoes.',
    category: 'outdoor',
    ageMin: 10,
    ageMax: 18,
    locationType: 'city',
    city: 'Boulder',
    cost: 'free',
    duration: 'half-day',
    indoorOutdoor: 'outdoor',
    skillLevel: 'beginner',
    tags: ['fitness'],
  },
  {
    title: 'Beach Cleanup Volunteer Day',
    description:
      'Spend a few hours helping your local beach. Gloves, bags, and water provided. Meet other teens who care about the planet.',
    category: 'volunteer',
    ageMin: 12,
    ageMax: 18,
    locationType: 'city',
    city: 'San Diego',
    cost: 'free',
    duration: 'half-day',
    indoorOutdoor: 'outdoor',
    skillLevel: 'any',
    tags: ['volunteering', 'clubs'],
  },
  {
    title: 'Math Olympiad Prep Circle',
    description:
      'Six weeks of problem-solving sessions covering number theory, combinatorics, and geometry. Friendly group, no grades.',
    category: 'academic',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'intermediate',
    tags: ['science', 'courses', 'clubs'],
  },
  {
    title: 'Teen Coding Camp: Make a Game',
    description:
      'Two-week online camp where you design and code a small 2D game. Live mentors, peer reviews, and a final showcase.',
    category: 'course',
    ageMin: 13,
    ageMax: 18,
    locationType: 'global',
    cost: 'paid',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'intermediate',
    tags: ['coding', 'gaming', 'courses'],
  },
  {
    title: 'Make a Short Film in a Weekend',
    description:
      'Plan, shoot, and edit a 3-minute film with friends. Borrow a phone camera and free editing software. Showcase at the end.',
    category: 'hobby',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'both',
    skillLevel: 'beginner',
    tags: ['art', 'music'],
  },
  {
    title: 'Run a 5K Training Plan',
    description:
      'Eight-week beginner plan to comfortably run a 5K. Three short runs per week, easy pace, no equipment needed.',
    category: 'sport',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'outdoor',
    skillLevel: 'beginner',
    tags: ['fitness', 'sports'],
  },
  {
    title: 'Piano Basics — Daily 20',
    description:
      'A 30-day challenge to learn piano using a free online keyboard or app. 20 focused minutes a day is all it takes.',
    category: 'hobby',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['music', 'courses'],
  },
  {
    title: 'Junior Entrepreneur Challenge',
    description:
      'Design a tiny business idea, build a one-page pitch, and present to a panel of student judges. Prizes and bragging rights.',
    category: 'club',
    ageMin: 14,
    ageMax: 18,
    locationType: 'national',
    city: 'United States',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'intermediate',
    tags: ['business', 'clubs'],
  },
  {
    title: 'Astronomy Night',
    description:
      'A local stargazing meet-up with telescopes and friendly guides. Learn to spot constellations and planets.',
    category: 'event',
    ageMin: 10,
    ageMax: 18,
    locationType: 'city',
    city: 'Tucson',
    cost: 'free',
    duration: '1-2hr',
    indoorOutdoor: 'outdoor',
    skillLevel: 'beginner',
    tags: ['science'],
  },
  {
    title: 'Chess Club Online',
    description:
      'Weekly online chess sessions for all skill levels. Friendly ladders, tactics training, and casual games.',
    category: 'club',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'any',
    tags: ['clubs', 'gaming'],
  },
  {
    title: 'DIY Robotics With Household Stuff',
    description:
      'Build a wobbly robot from cardboard, a motor, and tape. A great weekend project with friends.',
    category: 'hobby',
    ageMin: 10,
    ageMax: 14,
    locationType: 'global',
    cost: 'low',
    duration: 'half-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['coding', 'science', 'art'],
  },
  {
    title: '30-Minute Yoga for Energy',
    description:
      'A short beginner yoga flow you can do in your room. Improves focus, mood, and sleep. No equipment.',
    category: 'sport',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: '30min',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['fitness'],
    sourceUrl: 'https://www.youtube.com/results?search_query=beginner+yoga',
    providerName: 'YouTube',
  },
  {
    title: 'Volunteer at an Animal Shelter',
    description:
      'Help walk, feed, and socialize animals at your local shelter. Most welcome teen volunteers with parental consent.',
    category: 'volunteer',
    ageMin: 13,
    ageMax: 18,
    locationType: 'city',
    city: 'Austin',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'any',
    tags: ['volunteering'],
  },
  {
    title: 'Read a Classic Novel This Summer',
    description:
      'Pick a classic novel that scares you a little and finish it. Try Treasure Island, The Hobbit, or A Wrinkle in Time.',
    category: 'self_study',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'any',
    tags: ['reading'],
  },
  {
    title: 'Indie Game Jam',
    description:
      'Join a 48-hour online game jam with thousands of teens worldwide. Make something small, weird, and fun.',
    category: 'club',
    ageMin: 14,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'intermediate',
    tags: ['gaming', 'coding', 'art'],
    sourceUrl: 'https://itch.io/jams',
    providerName: 'itch.io',
  },
  {
    title: 'Bike Tour of Your City',
    description:
      'Plan a half-day bike ride through a part of your city you have never explored. Pack snacks, take photos.',
    category: 'outdoor',
    ageMin: 12,
    ageMax: 18,
    locationType: 'city',
    city: 'Portland',
    cost: 'free',
    duration: 'half-day',
    indoorOutdoor: 'outdoor',
    skillLevel: 'any',
    tags: ['fitness', 'outdoor'],
  },
  {
    title: 'Watercolor Painting Crash Course',
    description:
      'Six short lessons to get you comfortable with watercolor — from supplies to painting a tiny landscape.',
    category: 'hobby',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['art', 'courses'],
  },
  {
    title: 'DIY Photo Scavenger Hunt',
    description:
      'Make a list of 20 things to photograph in your neighborhood. Bonus points for weirdness.',
    category: 'boredom_buster',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: '1-2hr',
    indoorOutdoor: 'both',
    skillLevel: 'any',
    tags: ['art'],
  },
  {
    title: 'Build a Treehouse (Mini)',
    description:
      'A tiny indoor treehouse you can build from cardboard boxes. Great rainy-day project.',
    category: 'boredom_buster',
    ageMin: 10,
    ageMax: 14,
    locationType: 'global',
    cost: 'free',
    duration: 'half-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['art'],
  },
  {
    title: 'Astronomy Self-Study',
    description:
      'A 6-week self-paced course on stars, planets, and the universe. Includes night sky observation logs.',
    category: 'self_study',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'both',
    skillLevel: 'intermediate',
    tags: ['science', 'reading', 'courses'],
  },
  {
    title: 'Community Garden Helper',
    description:
      'Spend a few hours each week helping plant, water, and weed a community garden. Learn where food comes from.',
    category: 'volunteer',
    ageMin: 10,
    ageMax: 18,
    locationType: 'city',
    city: 'Seattle',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'outdoor',
    skillLevel: 'any',
    tags: ['volunteering'],
  },
  {
    title: 'High School Debate Bootcamp',
    description:
      'A one-week intensive to learn debate formats, build cases, and compete in a friendly tournament.',
    category: 'academic',
    ageMin: 14,
    ageMax: 18,
    locationType: 'global',
    cost: 'low',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'intermediate',
    tags: ['clubs', 'courses'],
  },
  {
    title: 'Beginner Guitar in 30 Days',
    description:
      'A friendly, no-judgment challenge to learn four chords and one song in 30 days.',
    category: 'hobby',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['music'],
  },
  {
    title: 'Make a Podcast Episode',
    description:
      'Pick a topic you love, interview a friend, and edit a 10-minute episode. Free tools available.',
    category: 'hobby',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['music', 'art'],
  },
  {
    title: 'Park Basketball Pickup Games',
    description:
      'Drop-in basketball at the local park. Most cities have weekend pickup games for teens.',
    category: 'sport',
    ageMin: 12,
    ageMax: 18,
    locationType: 'city',
    city: 'Chicago',
    cost: 'free',
    duration: '1-2hr',
    indoorOutdoor: 'outdoor',
    skillLevel: 'any',
    tags: ['sports', 'fitness'],
  },
  {
    title: 'Inventor’s Notebook Challenge',
    description:
      'Solve one small problem a day and sketch a solution. End of summer you have 60 ideas and a habit.',
    category: 'self_study',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'any',
    tags: ['art', 'science', 'business'],
  },
  {
    title: 'Intro to Personal Finance',
    description:
      'A self-paced course on budgeting, saving, and how money actually works. Designed for teens.',
    category: 'academic',
    ageMin: 14,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['business', 'courses'],
  },
  {
    title: 'Local Farmers Market Saturdays',
    description:
      'Most cities run weekend farmers markets. Walk around, try samples, learn about local food.',
    category: 'event',
    ageMin: 10,
    ageMax: 18,
    locationType: 'city',
    city: 'Brooklyn',
    cost: 'low',
    duration: '1-2hr',
    indoorOutdoor: 'outdoor',
    skillLevel: 'any',
    tags: ['volunteering'],
  },
  {
    title: 'Neighborhood Photography Walk',
    description:
      'Pick a 30-minute loop in your neighborhood. Photograph five things that catch your eye. Share one with a friend.',
    category: 'boredom_buster',
    ageMin: 10,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: '30min',
    indoorOutdoor: 'outdoor',
    skillLevel: 'any',
    tags: ['art'],
  },
  {
    title: 'Learn Sign Language Basics',
    description:
      'A friendly intro to ASL — alphabet, common phrases, and a community of practice partners.',
    category: 'course',
    ageMin: 12,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'ongoing',
    indoorOutdoor: 'indoor',
    skillLevel: 'beginner',
    tags: ['courses', 'clubs'],
  },
  {
    title: 'Build a Mobile App with Friends',
    description:
      'A two-week project where a small team designs and ships a tiny mobile app together. Free tools, online.',
    category: 'course',
    ageMin: 14,
    ageMax: 18,
    locationType: 'global',
    cost: 'free',
    duration: 'multi-day',
    indoorOutdoor: 'indoor',
    skillLevel: 'advanced',
    tags: ['coding', 'courses'],
  },
];

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
  console.log('Seeding tags…');
  for (const t of TAGS) {
    await prisma.activityTag.upsert({
      where: { slug: t.slug },
      create: t,
      update: { label: t.label, group: t.group },
    });
  }

  console.log('Clearing existing activities…');
  await prisma.savedItem.deleteMany({});
  await prisma.adminSubmission.deleteMany({});
  await prisma.activity.deleteMany({});

  console.log(`Seeding ${SEED.length} activities…`);
  for (const a of SEED) {
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