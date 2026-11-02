import { FAQ } from './faq';

describe('FAQ copy', () => {
  it('has eight unique questions', () => {
    expect(FAQ).toHaveLength(8);
    expect(new Set(FAQ.map((f) => f.q)).size).toBe(8);
  });

  it('keeps answers short enough to read in one go', () => {
    for (const item of FAQ) expect(item.a.length).toBeLessThan(260);
  });

  it('avoids hype words', () => {
    const text = FAQ.map((f) => f.a).join(' ').toLowerCase();
    for (const word of ['revolutionary', 'cutting-edge', 'ai-powered', 'guaranteed']) {
      expect(text).not.toContain(word);
    }
  });
});
