import type { DocumentType, MockOCRResult } from '../types';
import {
  CHEQUE_AMOUNT_MISMATCH,
  CHEQUE_CLEAN,
  CHEQUE_DISHONOURED_EBL,
  CHEQUE_MULTI_ISSUE,
  CHEQUE_NO_SIGNATURE,
  CHEQUE_STALE_DATE,
} from './mockData/chequeResults';
import { LOAN_CLEAN, LOAN_INCOMPLETE_FIELDS, LOAN_NO_GUARANTOR } from './mockData/loanResults';
import { NID_CLEAN, NID_EXPIRED, NID_LOW_QUALITY } from './mockData/nidResults';

export interface MockScenario {
  id: string;
  label: string;
  description: string;
  documentType: DocumentType;
  ocrResult: MockOCRResult;
  expectedWarningIds: string[];
  badge: 'CLEAN' | 'WARNING' | 'CRITICAL';
  /** When set, “Use mock document” loads this file instead of the default SVG for this document type */
  mockAssetPath?: string;
}

export const MOCK_SCENARIOS: Record<string, MockScenario> = {
  CHEQUE_CLEAN: {
    id: 'CHEQUE_CLEAN',
    label: 'Cheque - Clean',
    description: 'All cheque fields pass validation with a clear signature.',
    documentType: 'CHEQUE',
    ocrResult: CHEQUE_CLEAN,
    expectedWarningIds: [],
    badge: 'CLEAN',
  },
  CHEQUE_AMOUNT_MISMATCH: {
    id: 'CHEQUE_AMOUNT_MISMATCH',
    label: 'Cheque - Amount Mismatch',
    description: 'Numeric and written amount disagree on extracted cheque fields.',
    documentType: 'CHEQUE',
    ocrResult: CHEQUE_AMOUNT_MISMATCH,
    expectedWarningIds: ['CHQ_AMOUNT_MISMATCH'],
    badge: 'WARNING',
  },
  CHEQUE_NO_SIGNATURE: {
    id: 'CHEQUE_NO_SIGNATURE',
    label: 'Cheque - Signature Missing',
    description: 'Signature zone detection confidence indicates absent signature.',
    documentType: 'CHEQUE',
    ocrResult: CHEQUE_NO_SIGNATURE,
    expectedWarningIds: ['CHQ_SIGNATURE_MISSING'],
    badge: 'CRITICAL',
  },
  CHEQUE_STALE_DATE: {
    id: 'CHEQUE_STALE_DATE',
    label: 'Cheque - Stale Date',
    description: 'Cheque date exceeds validity threshold and should be flagged.',
    documentType: 'CHEQUE',
    ocrResult: CHEQUE_STALE_DATE,
    expectedWarningIds: ['CHQ_DATE_INVALID'],
    badge: 'WARNING',
  },
  CHEQUE_MULTI_ISSUE: {
    id: 'CHEQUE_MULTI_ISSUE',
    label: 'Cheque - Multiple Issues',
    description: 'Amount mismatch and stale date occur in the same document.',
    documentType: 'CHEQUE',
    ocrResult: CHEQUE_MULTI_ISSUE,
    expectedWarningIds: ['CHQ_AMOUNT_MISMATCH', 'CHQ_DATE_INVALID'],
    badge: 'CRITICAL',
  },
  CHEQUE_DISHONOURED_EBL: {
    id: 'CHEQUE_DISHONOURED_EBL',
    label: 'Cheque - Dishonoured (real scan)',
    description:
      'Eastern Bank Ltd. cheque image with clearing-bank stamp and stale date — simulates dishonoured/return path.',
    documentType: 'CHEQUE',
    ocrResult: CHEQUE_DISHONOURED_EBL,
    expectedWarningIds: ['CHQ_DISHONOUR_CLEARING', 'CHQ_DATE_INVALID'],
    badge: 'CRITICAL',
    mockAssetPath: '/assets/mock-documents/eastern-bank-cheque-dishonoured.png',
  },
  LOAN_CLEAN: {
    id: 'LOAN_CLEAN',
    label: 'Loan Form - Clean',
    description: 'Mandatory loan fields and guarantor details are complete.',
    documentType: 'LOAN_FORM',
    ocrResult: LOAN_CLEAN,
    expectedWarningIds: [],
    badge: 'CLEAN',
  },
  LOAN_INCOMPLETE_FIELDS: {
    id: 'LOAN_INCOMPLETE_FIELDS',
    label: 'Loan Form - Incomplete Fields',
    description: 'Mandatory sections are blank and should trigger completeness checks.',
    documentType: 'LOAN_FORM',
    ocrResult: LOAN_INCOMPLETE_FIELDS,
    expectedWarningIds: ['LOAN_MANDATORY_FIELDS'],
    badge: 'WARNING',
    mockAssetPath: '/assets/mock-documents/real-loan-agreement.png',
  },
  LOAN_NO_GUARANTOR: {
    id: 'LOAN_NO_GUARANTOR',
    label: 'Loan Form - No Guarantor',
    description: 'Guarantor section is missing despite required workflow policy.',
    documentType: 'LOAN_FORM',
    ocrResult: LOAN_NO_GUARANTOR,
    expectedWarningIds: ['LOAN_GUARANTOR_MISSING'],
    badge: 'CRITICAL',
  },
  NID_CLEAN: {
    id: 'NID_CLEAN',
    label: 'NID - Clean',
    description: 'NID extraction is complete with strong quality metrics.',
    documentType: 'NID',
    ocrResult: NID_CLEAN,
    expectedWarningIds: [],
    badge: 'CLEAN',
    mockAssetPath: '/assets/mock-documents/real-nid.png',
  },
  NID_LOW_QUALITY: {
    id: 'NID_LOW_QUALITY',
    label: 'NID - Low Image Quality',
    description: 'Lighting and blur quality are below acceptable confidence thresholds.',
    documentType: 'NID',
    ocrResult: NID_LOW_QUALITY,
    expectedWarningIds: ['NID_IMAGE_QUALITY'],
    badge: 'WARNING',
  },
  NID_EXPIRED: {
    id: 'NID_EXPIRED',
    label: 'NID - Expired',
    description: 'Identity card includes an expiry date older than current date.',
    documentType: 'NID',
    ocrResult: NID_EXPIRED,
    expectedWarningIds: ['NID_EXPIRY'],
    badge: 'CRITICAL',
  },
};

const documentOrder: DocumentType[] = ['CHEQUE', 'LOAN_FORM', 'NID', 'ACCOUNT_OPENING_FORM', 'UNKNOWN'];
const badgeOrder: Record<MockScenario['badge'], number> = { CLEAN: 0, WARNING: 1, CRITICAL: 2 };

export const SCENARIO_LIST: MockScenario[] = Object.values(MOCK_SCENARIOS).sort((a, b) => {
  const docDiff = documentOrder.indexOf(a.documentType) - documentOrder.indexOf(b.documentType);
  if (docDiff !== 0) return docDiff;
  return badgeOrder[a.badge] - badgeOrder[b.badge];
});

export function getScenariosForDocumentType(type: DocumentType): MockScenario[] {
  return SCENARIO_LIST.filter((scenario) => scenario.documentType === type);
}
