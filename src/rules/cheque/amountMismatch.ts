import { type ValidationRule, isChequeFields } from '../../types';
import { generateId } from '../../utils/idGenerator';

export const amountMismatchRule: ValidationRule = {
  id: 'CHQ_AMOUNT_MISMATCH',
  documentTypes: ['CHEQUE'],
  name: 'Amount Mismatch',
  description: 'Compares numeric and written cheque amounts after OCR parsing.',
  severity: 'HIGH',
  phase: 1,
  enabled: true,
  category: 'AMOUNT_VALIDATION',
  validate(ocrResult) {
    const fields = ocrResult.fields;
    if (!isChequeFields(fields)) {
      return {
        ruleId: 'CHQ_AMOUNT_MISMATCH',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const { numericAmount, writtenAmountParsed } = fields;
    if (numericAmount === null || writtenAmountParsed === null) {
      return {
        ruleId: 'CHQ_AMOUNT_MISMATCH',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    if (numericAmount === writtenAmountParsed) {
      return {
        ruleId: 'CHQ_AMOUNT_MISMATCH',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const diff = Math.abs(numericAmount - writtenAmountParsed);
    return {
      ruleId: 'CHQ_AMOUNT_MISMATCH',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'CHQ_AMOUNT_MISMATCH',
        ruleName: 'Amount Mismatch',
        severity: 'HIGH',
        title: 'Amount Mismatch',
        message: `Numeric ৳${numericAmount.toLocaleString('en-BD')} ≠ Written ৳${writtenAmountParsed.toLocaleString('en-BD')}`,
        detail: `Difference of ৳${diff.toLocaleString('en-BD')} detected between the numeric box and the written amount line. Verify both with the issuer.`,
        affectedField: 'Amount',
        boundingBox: { x: 0.55, y: 0.28, w: 0.35, h: 0.1 },
        suggestedAction: 'Ask the customer to confirm both the numeric and written amount fields.',
      },
      executionTimeMs: 0,
    };
  },
};

export const amountMismatch = amountMismatchRule;

export default amountMismatchRule;
