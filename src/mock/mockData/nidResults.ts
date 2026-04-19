import type { MockOCRResult } from '../../types';

const today = new Date();
const todayIso = today.toISOString().split('T')[0] ?? '';

const expiredDate = new Date();
expiredDate.setFullYear(expiredDate.getFullYear() - 2);
const expiredDateIso = expiredDate.toISOString().split('T')[0] ?? '';

export const NID_CLEAN: MockOCRResult = {
  documentType: 'NID',
  imageQuality: {
    overallScore: 0.91,
    lighting: 0.9,
    blur: 0.09,
    skew: 0.9,
  },
  processingTimeMs: 544,
  fields: {
    nidNumber: '19876543210987654',
    holderName: 'Fatema Begum',
    dateOfBirth: '1992-03-18',
    fatherName: 'Md. Kamal Hossain',
    motherName: 'Shirin Akter',
    address: 'House 12, Road 5, Mohammadpur, Dhaka-1207',
    issueDate: '2020-01-10',
    expiryDate: null,
    photoPresent: true,
    backSidePresent: true,
  },
  signatureDetection: {
    signaturePresent: false,
    signatureZoneScore: 0,
    signaturePosition: null,
  },
  confidence: {
    overall: 0.92,
    perField: {
      nidNumber: 0.95,
      holderName: 0.93,
      dateOfBirth: 0.92,
      fatherName: 0.91,
      motherName: 0.9,
      address: 0.89,
    },
  },
  rawText:
    'National ID Fatema Begum, father Md. Kamal Hossain, House 12 Road 5 Mohammadpur Dhaka',
};

export const NID_LOW_QUALITY: MockOCRResult = {
  documentType: 'NID',
  imageQuality: {
    overallScore: 0.48,
    lighting: 0.42,
    blur: 0.61,
    skew: 4.7,
  },
  processingTimeMs: 783,
  fields: {
    nidNumber: '19765432109876543',
    holderName: 'Fatema Begum',
    dateOfBirth: '1988-11-05',
    fatherName: 'Md. Kamal Hossain',
    motherName: 'Shirin Akter',
    address: 'House 12, Road 5, Mohammadpur, Dhaka-1207',
    issueDate: '2018-07-22',
    expiryDate: null,
    photoPresent: true,
    backSidePresent: true,
  },
  signatureDetection: {
    signaturePresent: false,
    signatureZoneScore: 0,
    signaturePosition: null,
  },
  confidence: {
    overall: 0.63,
    perField: {
      nidNumber: 0.71,
      holderName: 0.66,
      dateOfBirth: 0.62,
      fatherName: 0.58,
      motherName: 0.57,
      address: 0.54,
    },
  },
  rawText: 'Blurred NID scan with weak lighting and partial reflections',
};

export const NID_EXPIRED: MockOCRResult = {
  documentType: 'NID',
  imageQuality: {
    overallScore: 0.84,
    lighting: 0.82,
    blur: 0.17,
    skew: 2.2,
  },
  processingTimeMs: 665,
  fields: {
    nidNumber: '19934561234567891',
    holderName: 'Fatema Begum',
    dateOfBirth: '1985-09-14',
    fatherName: 'Md. Kamal Hossain',
    motherName: 'Shirin Akter',
    address: 'House 12, Road 5, Mohammadpur, Dhaka-1207',
    issueDate: '2015-04-17',
    expiryDate: expiredDateIso,
    photoPresent: true,
    backSidePresent: true,
  },
  signatureDetection: {
    signaturePresent: false,
    signatureZoneScore: 0,
    signaturePosition: null,
  },
  confidence: {
    overall: 0.86,
    perField: {
      nidNumber: 0.9,
      holderName: 0.88,
      dateOfBirth: 0.85,
      fatherName: 0.84,
      motherName: 0.83,
      address: 0.82,
      expiryDate: 0.8,
    },
  },
  rawText: 'NID record indicates expiry date ' + expiredDateIso + ' verified on ' + todayIso,
};
