import type { AppMode } from '../constants/appModes';
import type { DocumentType } from '../types/document';
import type { ChequeFields, MockOCRResult } from '../types/ocr';
import { isChequeFields, isLoanFormFields, isNIDFields } from '../types';
import { parseAmountFromWords } from '../utils/amountParser';
import { simulateDelay } from '../utils/delay';
import { MOCK_SCENARIOS } from './mockScenarios';

/**
 * Generates a fully randomized MockOCRResult for RANDOM_MODE.
 * All amounts, dates, confidence scores, and boolean flags are randomized
 * within realistic ranges. This tests the system's ability to handle
 * diverse inputs without crashing.
 */
function generateRandomOCRResult(documentType: DocumentType): MockOCRResult {
  const randomConfidence = (): number => Number.parseFloat((0.55 + Math.random() * 0.43).toFixed(3));
  const randomAmount = (): number => Math.floor((Math.random() * 200000) / 500) * 500; // Rounded to 500
  const randomBool = (trueProbability = 0.8): boolean => Math.random() < trueProbability;

  // Random date: between 9 months ago and 3 months in the future
  const randomDate = (): string => {
    const offset = Math.floor((Math.random() - 0.6) * 270); // -162 to +108 days
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toISOString().split('T')[0] ?? '';
  };

  const amount = randomAmount();
  // Always introduce mismatch to guarantee a warning
  const writtenAmountParsed = Math.floor(amount * (0.1 + Math.random() * 0.9));

  const writtenAmount = `${writtenAmountParsed} Taka Only`; // Simplified in random mode
  const parsedFallback = parseAmountFromWords(writtenAmount) ?? writtenAmountParsed;

  const chequeFields: ChequeFields = {
    numericAmount: amount,
    writtenAmount,
    writtenAmountParsed: parsedFallback,
    payeeName: randomBool(0.9) ? 'Random Payee Ltd.' : null,
    date: randomDate(),
    chequeNumber: String(Math.floor(100000 + Math.random() * 899999)),
    accountNumber: `${Math.floor(1000 + Math.random() * 8999)}****${Math.floor(100 + Math.random() * 899)}`,
    bankName: 'BRAC Bank Limited',
    branchName: 'Random Branch',
    micrLine: null,
    crossingMarks: randomBool(0.7),
  };

  // For simplicity in RANDOM_MODE, all document types use a cheque-like structure
  // with the documentType tag set correctly. Rules handle type narrowing.
  return {
    documentType,
    imageQuality: {
      overallScore: randomConfidence(),
      lighting: randomConfidence(),
      blur: Number.parseFloat((Math.random() * 0.4).toFixed(3)),
      skew: Number.parseFloat((Math.random() * 5).toFixed(2)),
    },
    processingTimeMs: Math.floor(900 + Math.random() * 600),
    fields: chequeFields,
    signatureDetection: {
      signaturePresent: randomBool(0.85),
      signatureZoneScore: randomConfidence(),
      signaturePosition: { x: 0.58, y: 0.72, w: 0.28, h: 0.13 },
    },
    confidence: {
      overall: randomConfidence(),
      perField: {
        numericAmount: randomConfidence(),
        writtenAmount: randomConfidence(),
        payeeName: randomConfidence(),
        date: randomConfidence(),
      },
    },
    rawText: '[RANDOM MODE - raw text not available]',
  };
}

/**
 * Returns the default clean scenario OCR result for a given document type.
 * Used as fallback when no scenario is selected.
 */
function getDefaultScenario(documentType: DocumentType): MockOCRResult {
  const defaultErrorMap: Record<DocumentType, string> = {
    CHEQUE: 'CHEQUE_DISHONOURED_EBL',
    LOAN_FORM: 'LOAN_INCOMPLETE_FIELDS',
    NID: 'NID_EXPIRED',
    ACCOUNT_OPENING_FORM: 'LOAN_INCOMPLETE_FIELDS',
    UNKNOWN: 'CHEQUE_DISHONOURED_EBL',
  };
  return MOCK_SCENARIOS[defaultErrorMap[documentType]].ocrResult;
}

function cloneOCRResult(result: MockOCRResult): MockOCRResult {
  return JSON.parse(JSON.stringify(result)) as MockOCRResult;
}

function monthsAgoIso(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date.toISOString().split('T')[0] ?? '';
}

function yearsAgoIso(years: number): string {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years);
  return date.toISOString().split('T')[0] ?? '';
}

function applyManualInjections(base: MockOCRResult, manualInjections: string[]): MockOCRResult {
  const result = cloneOCRResult(base);
  const active = new Set(manualInjections);

  if (isChequeFields(result.fields)) {
    if (active.has('CHQ_AMOUNT_MISMATCH')) {
      const currentNumericAmount = result.fields.numericAmount;
      if (typeof currentNumericAmount === 'number') {
        result.fields.writtenAmountParsed = Math.floor(currentNumericAmount / 10);
      }
    }

    if (active.has('CHQ_SIGNATURE_MISSING')) {
      result.signatureDetection.signaturePresent = false;
    }

    if (active.has('CHQ_DATE_INVALID')) {
      result.fields.date = monthsAgoIso(8);
    }

    if (active.has('CHQ_PAYEE_BLANK')) {
      result.fields.payeeName = '';
    }

    if (active.has('CHQ_DISHONOUR_CLEARING')) {
      result.fields.clearingReturnStampDetected = true;
      result.fields.clearingReturnStampLabel = result.fields.clearingReturnStampLabel ?? 'SIMULATED COLLECTING BANK STAMP';
    }
  }

  if (isLoanFormFields(result.fields)) {
    if (active.has('LOAN_MANDATORY_FIELDS')) {
      result.fields.mandatoryFields = result.fields.mandatoryFields.map((field, index) =>
        index < 2 ? { ...field, isEmpty: true, value: null } : field,
      );
    }

    if (active.has('LOAN_GUARANTOR_MISSING')) {
      result.fields.guarantorSection = {
        ...result.fields.guarantorSection,
        signaturePresent: false,
      };
    }
  }

  if (isNIDFields(result.fields)) {
    if (active.has('NID_IMAGE_QUALITY')) {
      result.imageQuality.overallScore = 0.45;
    }

    if (active.has('NID_EXPIRY')) {
      result.fields.expiryDate = yearsAgoIso(2);
    }
  }

  return result;
}

export async function mockOCRExtract(
  _file: File | null,
  documentType: DocumentType,
  scenarioId?: string,
  mode: AppMode = 'STANDARD_MODE',
  manualInjections: string[] = [],
): Promise<MockOCRResult> {
  await simulateDelay(900, 1500);

  if (mode === 'RANDOM_MODE') {
    return generateRandomOCRResult(documentType);
  }

  if (scenarioId && MOCK_SCENARIOS[scenarioId]) {
    return MOCK_SCENARIOS[scenarioId].ocrResult;
  }

  const defaultScenario = getDefaultScenario(documentType);
  if (mode === 'MANUAL_MODE') {
    return applyManualInjections(defaultScenario, manualInjections);
  }

  return defaultScenario;
}
