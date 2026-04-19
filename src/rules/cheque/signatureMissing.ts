import { type ValidationRule, isChequeFields } from '../../types';
import { generateId } from '../../utils/idGenerator';

export const signatureMissing: ValidationRule = {
  id: 'CHQ_SIGNATURE_MISSING',
  documentTypes: ['CHEQUE'],
  name: 'Signature Missing',
  description: 'Checks whether a cheque signature is detected in the expected zone.',
  severity: 'HIGH',
  phase: 1,
  enabled: true,
  category: 'SIGNATURE_DETECTION',
  validate(ocrResult) {
    if (!isChequeFields(ocrResult.fields)) {
      return {
        ruleId: 'CHQ_SIGNATURE_MISSING',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    if (ocrResult.signatureDetection.signaturePresent) {
      return {
        ruleId: 'CHQ_SIGNATURE_MISSING',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const percentage = Math.round(ocrResult.signatureDetection.signatureZoneScore * 100);
    return {
      ruleId: 'CHQ_SIGNATURE_MISSING',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'CHQ_SIGNATURE_MISSING',
        ruleName: 'Signature Missing',
        severity: 'HIGH',
        title: 'Signature Missing',
        message: 'No signature detected in the designated signature zone',
        detail: `The signature region was scanned with a confidence score of ${percentage}%. Re-capture if the signature is present but unclear.`,
        affectedField: 'Signature',
        boundingBox: { x: 0.58, y: 0.72, w: 0.3, h: 0.14 },
        suggestedAction: 'Verify the document physically and request the drawer to re-sign if missing.',
      },
      executionTimeMs: 0,
    };
  },
};
