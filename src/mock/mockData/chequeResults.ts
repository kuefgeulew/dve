import type { MockOCRResult } from '../../types';

const today = new Date();
const todayIso = today.toISOString().split('T')[0] ?? '';

const stale8Months = new Date();
stale8Months.setMonth(stale8Months.getMonth() - 8);
const stale8MonthsIso = stale8Months.toISOString().split('T')[0] ?? '';

const stale9Months = new Date();
stale9Months.setMonth(stale9Months.getMonth() - 9);
const stale9MonthsIso = stale9Months.toISOString().split('T')[0] ?? '';

export const CHEQUE_CLEAN: MockOCRResult = {
  documentType: 'CHEQUE',
  imageQuality: {
    overallScore: 0.92,
    lighting: 0.9,
    blur: 0.08,
    skew: 1.4,
  },
  processingTimeMs: 612,
  fields: {
    numericAmount: 25000,
    writtenAmount: 'Twenty Five Thousand Taka Only',
    writtenAmountParsed: 25000,
    payeeName: 'Karim Brothers Trading',
    date: todayIso,
    chequeNumber: '004521',
    accountNumber: '1501****089',
    bankName: 'BRAC Bank PLC',
    branchName: 'Mohakhali Branch',
    micrLine: '004521 1501****089 010',
    crossingMarks: true,
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.87,
    signaturePosition: {
      x: 0.72,
      y: 0.78,
      w: 0.2,
      h: 0.11,
    },
  },
  confidence: {
    overall: 0.91,
    perField: {
      numericAmount: 0.97,
      writtenAmount: 0.93,
      payeeName: 0.9,
      date: 0.96,
      chequeNumber: 0.95,
      accountNumber: 0.89,
    },
  },
  rawText: 'Pay Karim Brothers Trading BDT 25,000.00 Date ' + todayIso,
};

export const CHEQUE_AMOUNT_MISMATCH: MockOCRResult = {
  documentType: 'CHEQUE',
  imageQuality: {
    overallScore: 0.9,
    lighting: 0.87,
    blur: 0.11,
    skew: 1.8,
  },
  processingTimeMs: 655,
  fields: {
    numericAmount: 25000,
    writtenAmount: 'Two Thousand Five Hundred Taka Only',
    writtenAmountParsed: 2500,
    payeeName: 'Noor Enterprise Ltd',
    date: todayIso,
    chequeNumber: '004522',
    accountNumber: '2204****451',
    bankName: 'BRAC Bank PLC',
    branchName: 'Gulshan Branch',
    micrLine: '004522 2204****451 010',
    crossingMarks: true,
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.84,
    signaturePosition: {
      x: 0.71,
      y: 0.79,
      w: 0.2,
      h: 0.1,
    },
  },
  confidence: {
    overall: 0.86,
    perField: {
      numericAmount: 0.98,
      writtenAmount: 0.88,
      payeeName: 0.86,
      date: 0.95,
      chequeNumber: 0.94,
      accountNumber: 0.88,
    },
  },
  rawText: 'Pay Noor Enterprise Ltd BDT 25,000 words two thousand five hundred only',
};

export const CHEQUE_NO_SIGNATURE: MockOCRResult = {
  documentType: 'CHEQUE',
  imageQuality: {
    overallScore: 0.89,
    lighting: 0.86,
    blur: 0.12,
    skew: 2.1,
  },
  processingTimeMs: 701,
  fields: {
    numericAmount: 12500,
    writtenAmount: 'Twelve Thousand Five Hundred Taka Only',
    writtenAmountParsed: 12500,
    payeeName: 'Dhaka Hardware Co.',
    date: todayIso,
    chequeNumber: '004523',
    accountNumber: '1501****089',
    bankName: 'BRAC Bank PLC',
    branchName: 'Dhanmondi Branch',
    micrLine: '004523 1501****089 010',
    crossingMarks: true,
  },
  signatureDetection: {
    signaturePresent: false,
    signatureZoneScore: 0.11,
    signaturePosition: null,
  },
  confidence: {
    overall: 0.85,
    perField: {
      numericAmount: 0.96,
      writtenAmount: 0.88,
      payeeName: 0.84,
      date: 0.94,
      chequeNumber: 0.93,
      accountNumber: 0.9,
    },
  },
  rawText: 'Pay Dhaka Hardware Co. twelve thousand five hundred taka only',
};

export const CHEQUE_STALE_DATE: MockOCRResult = {
  documentType: 'CHEQUE',
  imageQuality: {
    overallScore: 0.9,
    lighting: 0.88,
    blur: 0.1,
    skew: 1.6,
  },
  processingTimeMs: 639,
  fields: {
    numericAmount: 250000,
    writtenAmount: 'Two Lakh Fifty Thousand Taka Only',
    writtenAmountParsed: 250000,
    payeeName: 'Rahim Enterprise',
    date: stale8MonthsIso,
    chequeNumber: '004524',
    accountNumber: '2204****451',
    bankName: 'BRAC Bank PLC',
    branchName: 'Gulshan Branch',
    micrLine: '004524 2204****451 010',
    crossingMarks: true,
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.86,
    signaturePosition: {
      x: 0.73,
      y: 0.79,
      w: 0.19,
      h: 0.1,
    },
  },
  confidence: {
    overall: 0.87,
    perField: {
      numericAmount: 0.97,
      writtenAmount: 0.92,
      payeeName: 0.88,
      date: 0.95,
      chequeNumber: 0.94,
      accountNumber: 0.9,
    },
  },
  rawText: 'Pay Rahim Enterprise two lakh fifty thousand date ' + stale8MonthsIso,
};

export const CHEQUE_MULTI_ISSUE: MockOCRResult = {
  documentType: 'CHEQUE',
  imageQuality: {
    overallScore: 0.76,
    lighting: 0.69,
    blur: 0.23,
    skew: 3.6,
  },
  processingTimeMs: 818,
  fields: {
    numericAmount: 75000,
    writtenAmount: 'Seven Thousand Five Hundred Taka Only',
    writtenAmountParsed: 7500,
    payeeName: 'Karim Brothers Trading',
    date: stale9MonthsIso,
    chequeNumber: '004525',
    accountNumber: '1501****089',
    bankName: 'BRAC Bank PLC',
    branchName: 'Mohakhali Branch',
    micrLine: '004525 1501****089 010',
    crossingMarks: true,
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.82,
    signaturePosition: {
      x: 0.7,
      y: 0.8,
      w: 0.21,
      h: 0.11,
    },
  },
  confidence: {
    overall: 0.73,
    perField: {
      numericAmount: 0.96,
      writtenAmount: 0.81,
      payeeName: 0.52,
      date: 0.91,
      chequeNumber: 0.9,
      accountNumber: 0.86,
    },
  },
  rawText: 'Pay Karim Brothers Trading seventy five thousand numeric 75000 date ' + stale9MonthsIso,
};

/** Real scan: Eastern Bank Ltd. cheque with IFIC clearing stamp — simulated “dishonoured” path (amounts match; date stale). */
export const CHEQUE_DISHONOURED_EBL: MockOCRResult = {
  documentType: 'CHEQUE',
  imageQuality: {
    overallScore: 0.84,
    lighting: 0.78,
    blur: 0.14,
    skew: 2.4,
  },
  processingTimeMs: 1120,
  fields: {
    numericAmount: 15000,
    writtenAmount: 'Fifteen thousand taka only',
    writtenAmountParsed: 15000,
    payeeName: 'Counsels law Partners',
    date: '2018-09-30',
    chequeNumber: '0486930',
    accountNumber: null,
    bankName: 'Eastern Bank Ltd.',
    branchName: 'Jiban Bima Bhaban, Dhaka',
    micrLine: '0486930 095264635 1131020015962 10',
    crossingMarks: true,
    clearingReturnStampDetected: true,
    clearingReturnStampLabel: 'IFIC BANK LIMITED GULSHAN BRANCH, DHAKA',
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.81,
    signaturePosition: { x: 0.62, y: 0.76, w: 0.26, h: 0.12 },
  },
  confidence: {
    overall: 0.82,
    perField: {
      numericAmount: 0.94,
      writtenAmount: 0.88,
      payeeName: 0.79,
      date: 0.91,
      chequeNumber: 0.93,
    },
  },
  rawText:
    'Eastern Bank Ltd. Pay To Counsels law Partners Fifteen thousand taka only Tk 15000/- IFIC BANK LIMITED GULSHAN BRANCH DHAKA',
};
