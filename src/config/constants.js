export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 720;
export const PIXEL_SCALE = 3;

// Player
export const PLAYER_SPEED = 300;
export const PLAYER_FIRE_RATE = 200; // ms between shots
export const PLAYER_LIVES = 3;
export const INVINCIBILITY_DURATION = 2000; // ms
export const EXTRA_LIFE_SCORE = 10000;

// Bullets
export const BULLET_SPEED = 500;
export const ENEMY_BULLET_SPEED = 250;
export const MAX_PLAYER_BULLETS = 30;
export const MAX_ENEMY_BULLETS = 30;

// Enemies
export const MAX_ENEMIES = 20;
export const ENEMY_TYPES = {
  scout:   { key: 'enemy1', hp: 1, speed: 120, score: 100, fireRate: 2000, pattern: 'straight', animated: false, angle: -90 },
  fighter: { key: 'enemy2', hp: 2, speed: 80,  score: 200, fireRate: 1500, pattern: 'zigzag', animated: false, angle: -90 },
  heavy:   { key: 'enemy3', hp: 3, speed: 60,  score: 300, fireRate: 1200, pattern: 'dive', animated: false, angle: -90 },
  small:   { key: 'enemy-small1', hp: 1, speed: 150, score: 150, fireRate: 0, pattern: 'straight', animated: false, angle: 180 },
  medium:  { key: 'enemy-medium1', hp: 3, speed: 70,  score: 250, fireRate: 1400, pattern: 'zigzag', animated: false, angle: 180 },
  big:     { key: 'enemy-big1', hp: 5, speed: 45,  score: 400, fireRate: 1000, pattern: 'straight', animated: false, angle: 180 },
  alien:   { key: 'alien-flying', hp: 2, speed: 130, score: 350, fireRate: 1800, pattern: 'zigzag', animated: true, animKey: 'alien-fly-anim', angle: -90 },
};

// Asteroids
export const MAX_ASTEROIDS = 10;
export const ASTEROID_LARGE = { key: 'asteroid', hp: 3, speed: 80, score: 50, scale: PIXEL_SCALE };
export const ASTEROID_SMALL = { key: 'asteroid-small', hp: 1, speed: 100, score: 25, scale: PIXEL_SCALE };
export const ASTEROID_VARIANTS = ['asteroid-v1', 'asteroid-v2', 'asteroid-v3', 'asteroid-v4', 'asteroid-v5'];

// Weapons
export const WEAPON_TYPES = {
  basic:  { name: 'Basic',  bulletKey: 'bullet',       piercing: false },
  spread: { name: 'Spread', bulletKey: 'bolt-bullet',  piercing: false },
  laser:  { name: 'Laser',  bulletKey: 'laser-bullet', piercing: true },
};

// Power-ups
export const POWERUP_DROP_CHANCE = 0.15;
export const POWERUP_TYPES = {
  spread: { key: 'powerup-spread', weight: 25 },
  laser:  { key: 'powerup-laser',  weight: 25 },
  shield: { key: 'powerup-shield', weight: 10 },
  bonus:  { key: 'powerup-bonus',  weight: 40 },
};

// Parallax scroll speeds
export const BG_SPEED_BACK = 0.3;
export const BG_SPEED_STARS = 0.6;
