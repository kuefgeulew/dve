import { type BoundingBox, type DocumentType } from './document';

export interface ImageQualityResult {
  overallScore: number; // 0.0-1.0
  lighting: number; // 0.0-1.0
  blur: number; // 0.0-1.0 (lower = better)
  skew: number; // degrees deviation from horizontal
}

export interface SignatureDetectionResult {
  signaturePresent: boolean;
  signatureZoneScore: number; // 0.0-1.0 confidence
  signaturePosition: BoundingBox | null;
}

export interface ConfidenceScores {
  overall: number;
  perField: Record<string, number>;
}

export interface ChequeFields {
  numericAmount: number | null;
  writtenAmount: string | null;
  writtenAmountParsed: number | null; // Parsed from words to number
  payeeName: string | null;
  date: string | null; // ISO 8601: YYYY-MM-DD
  chequeNumber: string | null;
  accountNumber: string | null;
  bankName: string | null;
  branchName: string | null;
  micrLine: string | null;
  crossingMarks: boolean; // true = A/C payee crossing present
  /** Simulated OCR: another bank’s stamp (e.g. collecting / clearing) often seen on returned or dishonoured items */
  clearingReturnStampDetected?: boolean;
  clearingReturnStampLabel?: string | null;
}

export interface MandatoryField {
  fieldId: string;
  label: string;
  value: string | null;
  isEmpty: boolean;
  confidence: number;
}

export interface LoanFormFields {
  applicantName: string | null;
  applicantNID: string | null;
  loanAmount: number | null;
  loanPurpose: string | null;
  mandatoryFields: MandatoryField[];
  guarantorSection: {
    present: boolean;
    guarantorName: string | null;
    signaturePresent: boolean;
  };
  applicantSignature: boolean;
  dateOfApplication: string | null;
}

export interface NIDFields {
  nidNumber: string | null;
  holderName: string | null;
  dateOfBirth: string | null;
  fatherName: string | null;
  motherName: string | null;
  address: string | null;
  issueDate: string | null;
  expiryDate: string | null; // null if no expiry (Smart NID)
  photoPresent: boolean;
  backSidePresent: boolean;
}

export interface AccountOpeningFields {
  applicantName: string | null;
  accountType: string | null; // e.g. 'SAVINGS', 'CURRENT'
  initialDeposit: number | null;
  nidNumber: string | null;
  nomineeSection: {
    present: boolean;
    nomineeName: string | null;
    nomineeNID: string | null;
    relationshipToApplicant: string | null;
  };
  applicantSignature: boolean;
  introducerName: string | null;
  introducerAccountNumber: string | null;
  dateOfApplication: string | null;
  mandatoryFields: MandatoryField[];
}

// Union type: fields vary by document type
export type DocumentFields =
  | ChequeFields
  | LoanFormFields
  | NIDFields
  | AccountOpeningFields;

export interface MockOCRResult {
  documentType: DocumentType;
  imageQuality: ImageQualityResult;
  processingTimeMs: number;
  fields: DocumentFields;
  signatureDetection: SignatureDetectionResult;
  confidence: ConfidenceScores;
  rawText: string;
}

// Type guards for narrowing DocumentFields at rule-execution time
export function isChequeFields(fields: DocumentFields): fields is ChequeFields {
  return 'numericAmount' in fields;
}

export function isLoanFormFields(fields: DocumentFields): fields is LoanFormFields {
  return 'guarantorSection' in fields && 'loanAmount' in fields;
}

export function isNIDFields(fields: DocumentFields): fields is NIDFields {
  return 'backSidePresent' in fields;
}

export function isAccountOpeningFields(fields: DocumentFields): fields is AccountOpeningFields {
  return 'accountType' in fields;
}
