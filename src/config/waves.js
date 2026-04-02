// Wave definitions organized by stage
// Each stage has 3 enemy waves followed by a boss wave
// formation: 'line' | 'v' | 'circle' | 'staggered'

export const STAGE_WAVES = [
  // ── Stage 1 (waves 1-3, then boss) ──
  [
    {
      enemies: [
        { type: 'scout', count: 4, formation: 'line', delay: 600 },
      ],
      asteroids: 1,
    },
    {
      enemies: [
        { type: 'scout', count: 3, formation: 'line', delay: 500 },
        { type: 'fighter', count: 2, formation: 'line', delay: 800 },
      ],
      asteroids: 1,
    },
    {
      enemies: [
        { type: 'fighter', count: 4, formation: 'v', delay: 500 },
        { type: 'scout', count: 3, formation: 'line', delay: 400 },
        { type: 'heavy', count: 2, formation: 'line', delay: 800 },
      ],
      asteroids: 2,
    },
  ],

  // ── Stage 2 (waves 4-6, then boss) ──
  [
    {
      enemies: [
        { type: 'small', count: 8, formation: 'v', delay: 200 },
        { type: 'fighter', count: 3, formation: 'line', delay: 600 },
      ],
      asteroids: 2,
    },
    {
      enemies: [
        { type: 'medium', count: 3, formation: 'line', delay: 700 },
        { type: 'small', count: 5, formation: 'staggered', delay: 300 },
        { type: 'scout', count: 4, formation: 'v', delay: 400 },
      ],
      asteroids: 3,
    },
    {
      enemies: [
        { type: 'big', count: 2, formation: 'line', delay: 1000 },
        { type: 'fighter', count: 4, formation: 'circle', delay: 500 },
        { type: 'alien', count: 3, formation: 'v', delay: 400 },
      ],
      asteroids: 3,
    },
  ],

  // ── Stage 3 (waves 7-9, then boss) ──
  [
    {
      enemies: [
        { type: 'alien', count: 4, formation: 'v', delay: 400 },
        { type: 'heavy', count: 3, formation: 'line', delay: 700 },
        { type: 'small', count: 6, formation: 'staggered', delay: 250 },
      ],
      asteroids: 3,
    },
    {
      enemies: [
        { type: 'big', count: 2, formation: 'line', delay: 900 },
        { type: 'alien', count: 5, formation: 'circle', delay: 350 },
        { type: 'medium', count: 4, formation: 'v', delay: 500 },
      ],
      asteroids: 4,
    },
    {
      enemies: [
        { type: 'big', count: 3, formation: 'line', delay: 800 },
        { type: 'alien', count: 4, formation: 'v', delay: 300 },
        { type: 'heavy', count: 4, formation: 'staggered', delay: 600 },
        { type: 'small', count: 8, formation: 'circle', delay: 200 },
      ],
      asteroids: 5,
    },
  ],
];

// Legacy flat export for backward compat
export const WAVES = STAGE_WAVES.flat();
