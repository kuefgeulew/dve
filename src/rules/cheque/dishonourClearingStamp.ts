import { type ValidationRule, isChequeFields } from '../../types';
import { generateId } from '../../utils/idGenerator';

/** Flags simulated clearing/return bank stamps typical of dishonoured or returned cheques. */
export const dishonourClearingStampRule: ValidationRule = {
  id: 'CHQ_DISHONOUR_CLEARING',
  documentTypes: ['CHEQUE'],
  name: 'Clearing / dishonour indicators',
  description:
    'Detects another bank’s branch stamp on the instrument (e.g. collecting bank), often associated with returned or dishonoured items.',
  severity: 'HIGH',
  phase: 1,
  enabled: true,
  category: 'FORMAT_CONSISTENCY',
  validate(ocrResult) {
    const fields = ocrResult.fields;
    if (!isChequeFields(fields)) {
      return {
        ruleId: 'CHQ_DISHONOUR_CLEARING',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    if (!fields.clearingReturnStampDetected) {
      return {
        ruleId: 'CHQ_DISHONOUR_CLEARING',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const stamp = fields.clearingReturnStampLabel?.trim();
    return {
      ruleId: 'CHQ_DISHONOUR_CLEARING',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'CHQ_DISHONOUR_CLEARING',
        ruleName: 'Clearing / dishonour indicators',
        severity: 'HIGH',
        title: 'Possible dishonoured / returned cheque',
        message: stamp
          ? `Collecting or return-path stamp detected: ${stamp}`
          : 'A clearing or return-bank stamp was detected on this cheque image.',
        detail:
          'Instruments with another bank’s branch stamp often indicate a dishonour or return through the clearing system. Verify status with clearing / operations before acceptance.',
        affectedField: 'Clearing stamps',
        boundingBox: { x: 0.12, y: 0.08, w: 0.55, h: 0.14 },
        suggestedAction: 'Confirm dishonour reason and customer instructions before proceeding.',
      },
      executionTimeMs: 0,
    };
  },
};
