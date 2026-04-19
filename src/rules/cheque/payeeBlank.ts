import { type ValidationRule, isChequeFields } from '../../types';
import { generateId } from '../../utils/idGenerator';

export const payeeBlank: ValidationRule = {
  id: 'CHQ_PAYEE_BLANK',
  documentTypes: ['CHEQUE'],
  name: 'Payee Blank',
  description: 'Checks whether cheque payee name is missing or unreadable.',
  severity: 'HIGH',
  phase: 1,
  enabled: true,
  category: 'FIELD_COMPLETENESS',
  validate(ocrResult) {
    const fields = ocrResult.fields;
    if (!isChequeFields(fields)) {
      return {
        ruleId: 'CHQ_PAYEE_BLANK',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const payeeName = fields.payeeName;
    const trimmedPayee = payeeName?.trim() ?? '';
    const isBearerPayee = trimmedPayee.toUpperCase() === 'BEARER';
    const isBlankorBearer = !payeeName || trimmedPayee === '' || isBearerPayee;

    if (!isBlankorBearer) {
      return {
        ruleId: 'CHQ_PAYEE_BLANK',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    return {
      ruleId: 'CHQ_PAYEE_BLANK',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'CHQ_PAYEE_BLANK',
        ruleName: 'Payee Blank',
        severity: 'HIGH',
        title: 'Payee Name Issue',
        message: isBearerPayee
          ? 'Bearer cheques are not permitted per branch policy. Payee name must be specified.'
          : 'Payee name field appears blank or unreadable',
        detail: isBearerPayee
          ? 'Branch policy requires a named payee. "BEARER" is not accepted for this workflow.'
          : 'The OCR output did not detect a usable payee name in the expected field.',
        affectedField: 'payeeName',
        boundingBox: { x: 0.05, y: 0.25, w: 0.55, h: 0.1 },
        suggestedAction: 'Ask the customer to reissue the cheque with a named payee.',
      },
      executionTimeMs: 0,
    };
  },
};
