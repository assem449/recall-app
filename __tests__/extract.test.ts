import { extractCards } from '../src/lib/extract';

describe('extractCards', () => {
  it('parses colon, dash and "is" definitions', () => {
    const cards = extractCards(
      [
        'Mitosis: cell division producing two identical cells',
        '- Osmosis - movement of water across a membrane',
        'A ribosome is a structure that builds proteins',
      ].join('\n'),
    );
    expect(cards.map((c) => c.front)).toEqual(['What is Mitosis?', 'What is Osmosis?', 'What is A ribosome?']);
    expect(cards[0].back).toBe('cell division producing two identical cells.');
  });

  it('ignores ordinary sentences and dedupes terms', () => {
    const cards = extractCards('Today we went to the lab and it was long and boring.\nDNA: carries genes\nDNA: genetic material of cells');
    expect(cards).toHaveLength(1);
    expect(cards[0].front).toBe('What is DNA?');
  });

  it('strips markdown and bullets', () => {
    const [c] = extractCards('1. **Entropy**: a measure of disorder in a system');
    expect(c.front).toBe('What is Entropy?');
  });
});
