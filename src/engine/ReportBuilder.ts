import type {
  DocumentType,
  DocumentValidationReport,
  MockOCRResult,
  ValidationResult,
} from '../types';
import { generateId } from '../utils/idGenerator';

export function buildReport(
  results: ValidationResult[],
  documentType: DocumentType,
  ocrResult: MockOCRResult,
): DocumentValidationReport {
  const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const warnings = results
    .map((r) => (r.passed ? null : r.warning))
    .filter((warning): warning is NonNullable<ValidationResult['warning']> => warning !== null)
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const confidenceValues = Object.values(ocrResult.confidence.perField);
  const avgConfidence =
    confidenceValues.length > 0
      ? confidenceValues.reduce((sum, v) => sum + v, 0) / confidenceValues.length
      : ocrResult.confidence.overall;

  return {
    id: generateId(),
    timestamp: new Date().toISOString(),
    documentType,
    imageQuality: ocrResult.imageQuality,
    ocrConfidenceAverage: Number.parseFloat(avgConfidence.toFixed(3)),
    totalRulesChecked: results.length,
    passedCount: results.filter((r) => r.passed).length,
    warningCount: warnings.length,
    warnings,
    overallStatus: warnings.length === 0 ? 'PASS' : 'WARNINGS',
    canProceed: true,
  };
}
