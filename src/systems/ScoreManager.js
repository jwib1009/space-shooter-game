const STORAGE_KEY = 'space-shooter-highscores';
const MAX_SCORES = 10;

export class ScoreManager {
  constructor() {
    this.score = 0;
  }

  add(points) {
    this.score += points;
  }

  reset() {
    this.score = 0;
  }

  getScore() {
    return this.score;
  }

  // High score persistence
  static getHighScores() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveHighScore(score) {
    if (!ScoreManager.isHighScore(score) || score <= 0) {
      return ScoreManager.getHighScores();
    }
    const scores = ScoreManager.getHighScores();
    scores.push({ score, date: Date.now() });
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, MAX_SCORES);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
    } catch {
      // localStorage unavailable
    }
    return top;
  }

  static isHighScore(score) {
    if (score <= 0) return false;
    const scores = ScoreManager.getHighScores();
    if (scores.length < MAX_SCORES) return true;
    return score > scores[scores.length - 1].score;
  }
}
