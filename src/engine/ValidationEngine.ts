import type { DocumentType, DocumentValidationReport, MockOCRResult } from '../types';
import { buildReport } from './ReportBuilder';
import { getRulesForDocument } from './RuleRegistry';
import { runAllRules } from './RuleExecutor';

export function runValidation(
  ocrResult: MockOCRResult,
  documentType: DocumentType,
  enabledRuleIds: string[],
): DocumentValidationReport {
  const rules = getRulesForDocument(documentType, enabledRuleIds);
  const results = runAllRules(rules, ocrResult);
  return buildReport(results, documentType, ocrResult);
}
