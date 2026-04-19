import { type ValidationRule, isChequeFields } from '../../types';
import { formatDate, isFarFuture, isStale, isValidDate } from '../../utils/dateValidator';
import { generateId } from '../../utils/idGenerator';

export const dateInvalid: ValidationRule = {
  id: 'CHQ_DATE_INVALID',
  documentTypes: ['CHEQUE'],
  name: 'Date Invalid',
  description: 'Validates cheque date readability, staleness, and extreme post-dating.',
  severity: 'MEDIUM',
  phase: 1,
  enabled: true,
  category: 'DATE_VALIDATION',
  validate(ocrResult) {
    const fields = ocrResult.fields;
    if (!isChequeFields(fields)) {
      return {
        ruleId: 'CHQ_DATE_INVALID',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const date = fields.date;
    if (date === null) {
      return {
        ruleId: 'CHQ_DATE_INVALID',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const baseWarning = {
      id: generateId(),
      ruleId: 'CHQ_DATE_INVALID',
      ruleName: 'Date Invalid',
      severity: 'MEDIUM' as const,
      title: 'Date Invalid',
      affectedField: 'Date',
      boundingBox: { x: 0.6, y: 0.14, w: 0.28, h: 0.08 },
    };

    if (!isValidDate(date)) {
      return {
        ruleId: 'CHQ_DATE_INVALID',
        passed: false,
        warning: {
          ...baseWarning,
          message: 'Unreadable date field',
          detail: 'The cheque date could not be parsed into a valid calendar date.',
          suggestedAction: 'Verify the cheque date and re-enter or re-scan the document.',
        },
        executionTimeMs: 0,
      };
    }

    if (isStale(date, 6)) {
      return {
        ruleId: 'CHQ_DATE_INVALID',
        passed: false,
        warning: {
          ...baseWarning,
          message: `Cheque date (${formatDate(date)}) is more than 6 months old`,
          detail: 'The cheque date exceeds the permissible stale period for processing.',
          suggestedAction: 'Ask the customer for a revalidated instrument or updated cheque.',
        },
        executionTimeMs: 0,
      };
    }

    if (isFarFuture(date, 90)) {
      return {
        ruleId: 'CHQ_DATE_INVALID',
        passed: false,
        warning: {
          ...baseWarning,
          message: `Cheque is post-dated by more than 90 days (${formatDate(date)})`,
          detail: 'The cheque date is too far in the future based on branch acceptance policy.',
          suggestedAction: 'Confirm acceptance policy or ask customer to provide an eligible date.',
        },
        executionTimeMs: 0,
      };
    }

    return {
      ruleId: 'CHQ_DATE_INVALID',
      passed: true,
      warning: null,
      executionTimeMs: 0,
    };
  },
};
