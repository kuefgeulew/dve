/**
 * Converts a Bangladeshi Taka written amount string to a number.
 * Handles: ones, teens, tens, hundreds, thousands, lakhs, crores.
 *
 * Examples:
 *   "Twenty Five Thousand Taka Only"           -> 25000
 *   "One Lakh Fifty Thousand"                  -> 150000
 *   "Five Hundred and Fifty"                   -> 550
 *   "Taka Two Thousand Three Hundred Only"     -> 2300
 *   "Two Crore Fifteen Lakh"                   -> 21500000
 *   "Eight Crore Seventy Lakh Fifty Thousand"  -> 87050000
 *   Returns null if parsing fails.
 */

const ONES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

const SCALES: Record<string, number> = {
  hundred: 100,
  thousand: 1000,
  lakh: 100000,
  crore: 10000000,
};

export function parseAmountFromWords(text: string | null): number | null {
  if (!text) return null;

  // Lowercase -> strip noise/punctuation -> tokenize
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\b(?:taka|only|and)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return null;

  const tokens = cleaned.split(' ').filter(Boolean);
  let total = 0;
  let currentGroup = 0;

  for (const token of tokens) {
    if (ONES[token] !== undefined) {
      currentGroup += ONES[token];
      continue;
    }

    if (TENS[token] !== undefined) {
      currentGroup += TENS[token];
      continue;
    }

    if (token === 'hundred') {
      if (currentGroup === 0) return null;
      currentGroup *= SCALES.hundred;
      continue;
    }

    if (token === 'thousand') {
      if (currentGroup === 0) return null;
      total += currentGroup * SCALES.thousand;
      currentGroup = 0;
      continue;
    }

    if (token === 'lakh') {
      if (currentGroup === 0) return null;
      total += currentGroup * SCALES.lakh;
      currentGroup = 0;
      continue;
    }

    if (token === 'crore') {
      if (currentGroup === 0) return null;
      total += currentGroup * SCALES.crore;
      currentGroup = 0;
      continue;
    }

    // Any non-noise unrecognized token invalidates parsing.
    return null;
  }

  return total + currentGroup;
}
