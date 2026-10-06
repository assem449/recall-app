// SM-2 spaced repetition. Grades: 0 = forgot, 1 = hard, 2 = good, 3 = easy.
export type Grade = 0 | 1 | 2 | 3;

export interface CardSchedule {
  ease: number; // ease factor, >= 1.3
  intervalDays: number;
  reps: number; // consecutive successful reviews
  dueAt: number; // epoch ms
}

const DAY = 24 * 60 * 60 * 1000;
const QUALITY: Record<Grade, number> = { 0: 1, 1: 3, 2: 4, 3: 5 };

export function newSchedule(now: number): CardSchedule {
  return { ease: 2.5, intervalDays: 0, reps: 0, dueAt: now };
}

export function review(s: CardSchedule, grade: Grade, now: number): CardSchedule {
  const q = QUALITY[grade];
  const ease = Math.max(1.3, s.ease + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (grade === 0) {
    // Lapse: relearn tomorrow, keep a (reduced) ease.
    return { ease, intervalDays: 1, reps: 0, dueAt: now + DAY };
  }

  let intervalDays: number;
  if (s.reps === 0) intervalDays = grade === 3 ? 4 : 1;
  else if (s.reps === 1) intervalDays = grade === 3 ? 8 : 6;
  else {
    const bonus = grade === 1 ? 0.8 : grade === 3 ? 1.3 : 1;
    intervalDays = Math.max(s.intervalDays + 1, Math.round(s.intervalDays * ease * bonus));
  }
  return { ease, intervalDays, reps: s.reps + 1, dueAt: now + intervalDays * DAY };
}

export function isDue(s: CardSchedule, now: number): boolean {
  return s.dueAt <= now;
}
