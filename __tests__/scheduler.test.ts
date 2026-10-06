import { newSchedule, review, isDue } from '../src/lib/scheduler';

const DAY = 86400000;

describe('scheduler', () => {
  it('new cards are due immediately', () => {
    expect(isDue(newSchedule(1000), 1000)).toBe(true);
  });

  it('grows intervals on repeated good reviews', () => {
    let s = newSchedule(0);
    s = review(s, 2, 0);
    expect(s.intervalDays).toBe(1);
    s = review(s, 2, DAY);
    expect(s.intervalDays).toBe(6);
    s = review(s, 2, 7 * DAY);
    expect(s.intervalDays).toBeGreaterThan(6);
    expect(s.dueAt).toBe(7 * DAY + s.intervalDays * DAY);
  });

  it('a lapse resets reps and schedules tomorrow, ease never below 1.3', () => {
    let s = newSchedule(0);
    for (let i = 0; i < 20; i++) s = review(s, 0, 0);
    expect(s.reps).toBe(0);
    expect(s.intervalDays).toBe(1);
    expect(s.ease).toBeCloseTo(1.3);
  });

  it('easy beats good beats hard', () => {
    const base = review(review(newSchedule(0), 2, 0), 2, 0);
    const [h, g, e] = ([1, 2, 3] as const).map((gr) => review(base, gr, 0).intervalDays);
    expect(e).toBeGreaterThan(g);
    expect(g).toBeGreaterThan(h);
  });
});
