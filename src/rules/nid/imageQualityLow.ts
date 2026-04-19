import { type ValidationRule, isNIDFields } from '../../types';
import { generateId } from '../../utils/idGenerator';

export const imageQualityLow: ValidationRule = {
  id: 'NID_IMAGE_QUALITY',
  documentTypes: ['NID'],
  name: 'NID Image Quality Low',
  description: 'Flags NID images that are too poor for reliable OCR and verification.',
  severity: 'MEDIUM',
  phase: 1,
  enabled: true,
  category: 'IMAGE_QUALITY',
  validate(ocrResult) {
    if (!isNIDFields(ocrResult.fields)) {
      return {
        ruleId: 'NID_IMAGE_QUALITY',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    const score = ocrResult.imageQuality.overallScore;
    if (score >= 0.65) {
      return {
        ruleId: 'NID_IMAGE_QUALITY',
        passed: true,
        warning: null,
        executionTimeMs: 0,
      };
    }

    return {
      ruleId: 'NID_IMAGE_QUALITY',
      passed: false,
      warning: {
        id: generateId(),
        ruleId: 'NID_IMAGE_QUALITY',
        ruleName: 'Image Quality',
        severity: 'MEDIUM',
        title: 'Low Image Quality',
        message: `NID image quality is low (${Math.round(score * 100)}%). Re-capture with better lighting.`,
        detail: `Lighting: ${Math.round(ocrResult.imageQuality.lighting * 100)}% | Blur: ${Math.round(ocrResult.imageQuality.blur * 100)}%`,
        affectedField: 'Image',
        boundingBox: null,
        suggestedAction: 'Ask the customer to provide a clearer photocopy or use the branch scanner.',
      },
      executionTimeMs: 0,
    };
  },
};
