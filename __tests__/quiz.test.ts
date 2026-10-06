import { buildQuiz } from '../src/lib/quiz';

const cards = [1, 2, 3, 4, 5].map((i) => ({ id: i, front: `Q${i}`, back: `A${i}` }));

describe('buildQuiz', () => {
  it('needs two cards', () => {
    expect(buildQuiz(cards.slice(0, 1), 5)).toEqual([]);
  });
  it('puts the right answer at answerIndex with unique options', () => {
    const qs = buildQuiz(cards, 5);
    expect(qs).toHaveLength(5);
    for (const q of qs) {
      expect(q.options[q.answerIndex]).toBe(`A${q.cardId}`);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.options.length).toBeLessThanOrEqual(4);
    }
  });
});
