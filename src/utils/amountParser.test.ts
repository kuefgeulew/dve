import { describe, expect, it } from 'vitest';
import { parseAmountFromWords } from './amountParser';

describe('parseAmountFromWords', () => {
  it('parses "Twenty Five Thousand Taka Only"', () =>
    expect(parseAmountFromWords('Twenty Five Thousand Taka Only')).toBe(25000));

  it('parses "Five Hundred"', () => expect(parseAmountFromWords('Five Hundred')).toBe(500));

  it('parses "One Lakh Fifty Thousand"', () =>
    expect(parseAmountFromWords('One Lakh Fifty Thousand')).toBe(150000));

  it('parses "Taka Two Thousand Three Hundred and Fifty Only"', () =>
    expect(parseAmountFromWords('Taka Two Thousand Three Hundred and Fifty Only')).toBe(2350));

  it('parses "Two Crore Twenty Five Lakh"', () =>
    expect(parseAmountFromWords('Two Crore Twenty Five Lakh')).toBe(22500000));

  it('returns null for garbage input', () => expect(parseAmountFromWords('xyzzy foo')).toBeNull());

  it('returns null for null input', () => expect(parseAmountFromWords(null)).toBeNull());

  it('parses "Two Thousand Five Hundred Taka Only"', () =>
    expect(parseAmountFromWords('Two Thousand Five Hundred Taka Only')).toBe(2500));
});
