/**
 * Synonym mapping for educational search expansion & typo correction
 */
const SYNONYMS: Record<string, string> = {
  derivative: 'differentiation',
  derivatives: 'differentiation',
  diff: 'differentiation',
  integral: 'integration',
  integrals: 'integration',
  calculus: 'calculus',
  calc: 'calculus',
  algo: 'algorithm',
  algos: 'algorithm',
  math: 'mathematics',
  maths: 'mathematics',
  phy: 'physics',
  chem: 'chemistry',
  bio: 'biology',
  py: 'python',
  js: 'javascript',
  ts: 'typescript',
  eqn: 'equation',
  eqns: 'equation',
  polynomials: 'polynomial',
  quad: 'quadratic',
  matrix: 'matrices',
  trig: 'trigonometry',
  geom: 'geometry',
  prob: 'probability',
  stats: 'statistics',
};

/**
 * Normalizes user queries for PostgreSQL full-text and trigram ranking:
 * 1. Cap length at 200 chars
 * 2. Lowercase
 * 3. Strip accents (unaccent)
 * 4. Strip punctuation except +, -, and double quotes
 * 5. Expand educational synonyms & abbreviations
 */
export function normalizeQuery(query: string): { normalized: string; rawCleaned: string } {
  if (!query) return { normalized: '', rawCleaned: '' };

  // 1. Cap at 200 characters
  let str = query.slice(0, 200).trim().toLowerCase();

  // 2. Strip accents
  str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Keep a cleaned raw version for trigram similarity (letters, numbers, spaces)
  const rawCleaned = str.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

  // 3. Strip punctuation except +, -, and double quotes for websearch_to_tsquery
  const sanitizedQuery = str
    .replace(/[^\w\s+\-"]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 4. Tokenize and apply synonym dictionary expansions
  const words = sanitizedQuery.split(' ');
  const expandedWords = words.map((w) => {
    // Preserve negation and quotes if present
    const cleanWord = w.replace(/^[+-]/, '').replace(/^"|"$/g, '');
    const mapped = SYNONYMS[cleanWord];
    if (mapped) {
      if (w.startsWith('-')) return `-${mapped}`;
      if (w.startsWith('+')) return `+${mapped}`;
      return mapped;
    }
    return w;
  });

  const normalized = expandedWords.join(' ').trim();

  return {
    normalized,
    rawCleaned,
  };
}

