import { describe, expect, it } from 'vitest';
import { CHEQUE_AMOUNT_MISMATCH, CHEQUE_CLEAN } from '../../mock/mockData/chequeResults';
import type { MockOCRResult } from '../../types';
import { amountMismatchRule } from './amountMismatch';

describe('CHQ_AMOUNT_MISMATCH rule', () => {
  it('passes when numeric and written amounts match', () => {
    const result = amountMismatchRule.validate(CHEQUE_CLEAN);
    expect(result.passed).toBe(true);
    expect(result.warning).toBeNull();
  });

  it('fails when amounts differ', () => {
    const result = amountMismatchRule.validate(CHEQUE_AMOUNT_MISMATCH);
    expect(result.passed).toBe(false);
    expect(result.warning).not.toBeNull();
    expect(result.warning?.severity).toBe('HIGH');
    expect(result.warning?.ruleId).toBe('CHQ_AMOUNT_MISMATCH');
  });

  it('passes when amount fields are null', () => {
    const nullAmountResult: MockOCRResult = {
      ...CHEQUE_CLEAN,
      fields: { ...CHEQUE_CLEAN.fields, numericAmount: null, writtenAmountParsed: null },
    };

    const result = amountMismatchRule.validate(nullAmountResult);
    expect(result.passed).toBe(true);
  });
});
