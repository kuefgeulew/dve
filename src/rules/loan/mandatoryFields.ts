import { type ValidationRule, isLoanFormFields } from '../../types';
import { generateId } from '../../utils/idGenerator';

export const mandatoryFields: ValidationRule = {
  id: 'LOAN_MANDATORY_FIELDS',
  documentTypes: ['LOAN_FORM'],
  name: 'Mandatory Fields Check',
  description: 'Ensures all required loan application fields are completed.',
  severity: 'HIGH',
  phase: 1,
  enabled: true,
  category: 'FIELD_COMPLETENESS',
  validate(ocrResult) {
    const fields = ocrResult.fields;
    if (!isLoanFormFields(fields)) {
      return {
        ruleId: 'LOAN_MANDATORY_FIELDS',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const empty = fields.mandatoryFields.filter((f) => f.isEmpty);
    if (empty.length === 0) {
      return {
        ruleId: 'LOAN_MANDATORY_FIELDS',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    return {
      ruleId: 'LOAN_MANDATORY_FIELDS',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'LOAN_MANDATORY_FIELDS',
        ruleName: 'Mandatory Fields Missing',
        severity: 'HIGH',
        title: 'Incomplete Mandatory Fields',
        message: `${empty.length} required field(s) incomplete: ${empty.map((f) => f.label).join(', ')}`,
        detail: 'These fields are mandatory per BRPD Circular 14. The form cannot be processed without them.',
        affectedField: 'Mandatory Fields',
        boundingBox: null,
        suggestedAction: 'Return the form to the applicant to complete all highlighted fields.',
      },
      executionTimeMs: 0,
    };
  },
};
