import { type BoundingBox, type DocumentType } from './document';
import { type ImageQualityResult } from './ocr';
import { type Severity } from './rules';

export interface Warning {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: Severity;
  title: string;
  message: string;
  detail: string;
  affectedField: string | null;
  boundingBox: BoundingBox | null;
  suggestedAction: string;
}

export interface ValidationResult {
  ruleId: string;
  passed: boolean;
  warning: Warning | null;
  executionTimeMs: number;
  executionError?: string;
}

export interface DocumentValidationReport {
  id: string;
  timestamp: string; // ISO 8601
  documentType: DocumentType;
  imageQuality: ImageQualityResult;
  ocrConfidenceAverage: number;
  totalRulesChecked: number;
  passedCount: number;
  warningCount: number;
  warnings: Warning[];
  overallStatus: 'PASS' | 'WARNINGS';
  canProceed: true; // LITERAL TYPE true - this field is NEVER false in this system.
  // The TypeScript type enforces the design constraint.
}
