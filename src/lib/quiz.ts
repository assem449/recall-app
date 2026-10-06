export interface QuizCard {
  id: number;
  front: string;
  back: string;
}

export interface Question {
  cardId: number;
  prompt: string;
  options: string[];
  answerIndex: number;
}

export function shuffle<T>(arr: T[], rand: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Multiple choice: the correct back plus up to 3 distractor backs from other cards.
// Needs at least 2 cards to build a question.
export function buildQuiz(cards: QuizCard[], count: number, rand: () => number = Math.random): Question[] {
  if (cards.length < 2) return [];
  return shuffle(cards, rand)
    .slice(0, count)
    .map((card) => {
      const distractors = shuffle(
        cards.filter((c) => c.id !== card.id && c.back !== card.back).map((c) => c.back),
        rand,
      ).slice(0, 3);
      const options = shuffle([card.back, ...distractors], rand);
      return { cardId: card.id, prompt: card.front, options, answerIndex: options.indexOf(card.back) };
    });
}
