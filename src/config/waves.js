// Wave definitions — each wave has enemy groups and asteroid count
// formation: 'line' | 'v' | 'circle' | 'staggered'
export const WAVES = [
  // Wave 1 — easy intro
  {
    enemies: [
      { type: 'scout', count: 4, formation: 'line', delay: 600 },
    ],
    asteroids: 1,
  },
  // Wave 2
  {
    enemies: [
      { type: 'scout', count: 3, formation: 'line', delay: 500 },
      { type: 'fighter', count: 2, formation: 'line', delay: 800 },
    ],
    asteroids: 1,
  },
  // Wave 3
  {
    enemies: [
      { type: 'fighter', count: 4, formation: 'v', delay: 500 },
      { type: 'scout', count: 3, formation: 'line', delay: 400 },
    ],
    asteroids: 2,
  },
  // Wave 4 — introduce heavy
  {
    enemies: [
      { type: 'heavy', count: 2, formation: 'line', delay: 800 },
      { type: 'scout', count: 5, formation: 'staggered', delay: 400 },
    ],
    asteroids: 2,
  },
  // Wave 5 — introduce small swarm
  {
    enemies: [
      { type: 'small', count: 8, formation: 'v', delay: 200 },
      { type: 'fighter', count: 3, formation: 'line', delay: 600 },
    ],
    asteroids: 2,
  },
  // Wave 6 — introduce medium
  {
    enemies: [
      { type: 'medium', count: 3, formation: 'line', delay: 700 },
      { type: 'small', count: 5, formation: 'staggered', delay: 300 },
      { type: 'scout', count: 4, formation: 'v', delay: 400 },
    ],
    asteroids: 3,
  },
  // Wave 7 — introduce big
  {
    enemies: [
      { type: 'big', count: 2, formation: 'line', delay: 1000 },
      { type: 'fighter', count: 4, formation: 'circle', delay: 500 },
    ],
    asteroids: 3,
  },
  // Wave 8 — introduce alien
  {
    enemies: [
      { type: 'alien', count: 4, formation: 'v', delay: 400 },
      { type: 'heavy', count: 3, formation: 'line', delay: 700 },
      { type: 'small', count: 6, formation: 'staggered', delay: 250 },
    ],
    asteroids: 3,
  },
  // Wave 9 — mixed assault
  {
    enemies: [
      { type: 'big', count: 2, formation: 'line', delay: 900 },
      { type: 'alien', count: 5, formation: 'circle', delay: 350 },
      { type: 'medium', count: 4, formation: 'v', delay: 500 },
    ],
    asteroids: 4,
  },
  // Wave 10 — final wave, everything
  {
    enemies: [
      { type: 'big', count: 3, formation: 'line', delay: 800 },
      { type: 'alien', count: 4, formation: 'v', delay: 300 },
      { type: 'heavy', count: 4, formation: 'staggered', delay: 600 },
      { type: 'small', count: 8, formation: 'circle', delay: 200 },
    ],
    asteroids: 5,
  },
];
