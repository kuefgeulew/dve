import { type ValidationRule, isNIDFields } from '../../types';
import { formatDate, isStale } from '../../utils/dateValidator';
import { generateId } from '../../utils/idGenerator';

export const expiryCheck: ValidationRule = {
  id: 'NID_EXPIRY',
  documentTypes: ['NID'],
  name: 'NID Expiry Check',
  description: 'Checks whether the NID expiry date exists and is still valid.',
  severity: 'LOW',
  phase: 1,
  enabled: true,
  category: 'IDENTITY_VERIFICATION',
  validate(ocrResult) {
    const fields = ocrResult.fields;
    if (!isNIDFields(fields)) {
      return {
        ruleId: 'NID_EXPIRY',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const { expiryDate } = fields;
    if (expiryDate === null) {
      return {
        ruleId: 'NID_EXPIRY',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    if (!isStale(expiryDate, 0)) {
      return {
        ruleId: 'NID_EXPIRY',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    return {
      ruleId: 'NID_EXPIRY',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'NID_EXPIRY',
        ruleName: 'NID Expiry',
        severity: 'LOW',
        title: 'NID Expired',
        message: `NID appears expired. Expiry: ${formatDate(expiryDate)}`,
        detail: 'The provided expiry date is in the past and should be renewed before processing.',
        affectedField: 'Expiry Date',
        boundingBox: null,
        suggestedAction: 'Ask the customer to present their updated Smart NID or renewal certificate.',
      },
      executionTimeMs: 0,
    };
  },
};
