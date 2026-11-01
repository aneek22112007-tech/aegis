const SYNONYMS: Record<string, string[]> = {
  pharmacy: ['pharmacy', 'cvs', 'walgreens', 'drugstore'],
  utility: ['utility', 'utilities', 'power', 'electric', 'water'],
};

export function matchesList(payeeName: string, entries: string[]): boolean {
  const name = payeeName.trim().toLowerCase();
  if (!name) return false;
  return entries.some((entry) => {
    const needle = entry.trim().toLowerCase();
    if (!needle) return false;
    if (name === needle || name.includes(needle) || needle.includes(name)) return true;
    return Object.entries(SYNONYMS).some(([key, words]) => {
      const entryHits = needle.includes(key) || words.some((word) => needle.includes(word));
      const nameHits = name.includes(key) || words.some((word) => name.includes(word));
      return entryHits && nameHits;
    });
  });
}
