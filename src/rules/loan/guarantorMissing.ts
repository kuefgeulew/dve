import { type ValidationRule, isLoanFormFields } from '../../types';
import { generateId } from '../../utils/idGenerator';

export const guarantorMissing: ValidationRule = {
  id: 'LOAN_GUARANTOR_MISSING',
  documentTypes: ['LOAN_FORM'],
  name: 'Guarantor Missing',
  description: 'Checks guarantor section presence and guarantor signature completeness.',
  severity: 'MEDIUM',
  phase: 1,
  enabled: true,
  category: 'FIELD_COMPLETENESS',
  validate(ocrResult) {
    const fields = ocrResult.fields;
    if (!isLoanFormFields(fields)) {
      return {
        ruleId: 'LOAN_GUARANTOR_MISSING',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const { guarantorSection } = fields;
    if (guarantorSection.present && guarantorSection.signaturePresent) {
      return {
        ruleId: 'LOAN_GUARANTOR_MISSING',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    return {
      ruleId: 'LOAN_GUARANTOR_MISSING',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'LOAN_GUARANTOR_MISSING',
        ruleName: 'Guarantor Missing',
        severity: 'MEDIUM',
        title: 'Guarantor Missing',
        message: 'Guarantor section incomplete or missing signature',
        detail: 'The guarantor block is absent or the guarantor signature could not be verified.',
        affectedField: 'Guarantor Section',
        boundingBox: null,
        suggestedAction: 'Ensure guarantor has signed the designated section.',
      },
      executionTimeMs: 0,
    };
  },
};
