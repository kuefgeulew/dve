import { type DocumentType } from './document';
import { type MockOCRResult } from './ocr';
import { type ValidationResult } from './validation';

export type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

export type RuleCategory =
  | 'AMOUNT_VALIDATION'
  | 'FIELD_COMPLETENESS'
  | 'SIGNATURE_DETECTION'
  | 'DATE_VALIDATION'
  | 'IMAGE_QUALITY'
  | 'IDENTITY_VERIFICATION'
  | 'FORMAT_CONSISTENCY';

export interface ValidationRule {
  id: string;
  documentTypes: DocumentType[];
  name: string;
  description: string;
  severity: Severity;
  phase: number;
  enabled: boolean;
  category: RuleCategory;
  validate: (ocrResult: MockOCRResult) => ValidationResult;
}
