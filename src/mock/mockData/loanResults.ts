import type { MockOCRResult } from '../../types';

const todayIso = new Date().toISOString().split('T')[0] ?? '';

export const LOAN_CLEAN: MockOCRResult = {
  documentType: 'LOAN_FORM',
  imageQuality: {
    overallScore: 0.9,
    lighting: 0.89,
    blur: 0.12,
    skew: 1.2,
  },
  processingTimeMs: 932,
  fields: {
    applicantName: 'Md. Hasan Ali',
    applicantNID: '19912654321098765',
    loanAmount: 750000,
    loanPurpose: 'Working Capital',
    mandatoryFields: [
      {
        fieldId: 'income_declaration',
        label: 'Monthly Income Declaration',
        value: '120000',
        isEmpty: false,
        confidence: 0.9,
      },
      {
        fieldId: 'asset_details',
        label: 'Asset Details',
        value: 'Apartment and small business inventory',
        isEmpty: false,
        confidence: 0.87,
      },
      {
        fieldId: 'reference_contact',
        label: 'Reference Contact',
        value: '01711-223344',
        isEmpty: false,
        confidence: 0.92,
      },
      {
        fieldId: 'employment_status',
        label: 'Employment Status',
        value: 'Business Owner',
        isEmpty: false,
        confidence: 0.89,
      },
      {
        fieldId: 'present_address',
        label: 'Present Address',
        value: 'House 23, Road 11, Mirpur DOHS, Dhaka',
        isEmpty: false,
        confidence: 0.88,
      },
    ],
    guarantorSection: {
      present: true,
      guarantorName: 'Sadia Rahman',
      signaturePresent: true,
    },
    applicantSignature: true,
    dateOfApplication: todayIso,
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.9,
    signaturePosition: {
      x: 0.68,
      y: 0.84,
      w: 0.24,
      h: 0.09,
    },
  },
  confidence: {
    overall: 0.88,
    perField: {
      applicantName: 0.91,
      applicantNID: 0.9,
      loanAmount: 0.94,
      loanPurpose: 0.87,
      guarantorName: 0.85,
    },
  },
  rawText: 'Loan application for Md. Hasan Ali amount 750000 purpose working capital',
};

export const LOAN_INCOMPLETE_FIELDS: MockOCRResult = {
  documentType: 'LOAN_FORM',
  imageQuality: {
    overallScore: 0.79,
    lighting: 0.74,
    blur: 0.21,
    skew: 2.5,
  },
  processingTimeMs: 1044,
  fields: {
    applicantName: 'Nusrat Jahan',
    applicantNID: '19874561234567890',
    loanAmount: 450000,
    loanPurpose: 'Home Renovation',
    mandatoryFields: [
      {
        fieldId: 'income_declaration',
        label: 'Monthly Income Declaration',
        value: null,
        isEmpty: true,
        confidence: 0,
      },
      {
        fieldId: 'asset_details',
        label: 'Asset Details',
        value: null,
        isEmpty: true,
        confidence: 0,
      },
      {
        fieldId: 'reference_contact',
        label: 'Reference Contact',
        value: null,
        isEmpty: true,
        confidence: 0,
      },
      {
        fieldId: 'employment_status',
        label: 'Employment Status',
        value: 'Private Service',
        isEmpty: false,
        confidence: 0.86,
      },
      {
        fieldId: 'present_address',
        label: 'Present Address',
        value: 'Block B, Shahjadpur, Dhaka',
        isEmpty: false,
        confidence: 0.82,
      },
    ],
    guarantorSection: {
      present: true,
      guarantorName: 'Shamim Reza',
      signaturePresent: true,
    },
    applicantSignature: true,
    dateOfApplication: todayIso,
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.83,
    signaturePosition: {
      x: 0.69,
      y: 0.85,
      w: 0.22,
      h: 0.09,
    },
  },
  confidence: {
    overall: 0.74,
    perField: {
      applicantName: 0.88,
      applicantNID: 0.84,
      loanAmount: 0.92,
      loanPurpose: 0.8,
      guarantorName: 0.77,
    },
  },
  rawText: 'Loan form Nusrat Jahan some mandatory fields blank',
};

export const LOAN_NO_GUARANTOR: MockOCRResult = {
  documentType: 'LOAN_FORM',
  imageQuality: {
    overallScore: 0.86,
    lighting: 0.85,
    blur: 0.14,
    skew: 1.8,
  },
  processingTimeMs: 977,
  fields: {
    applicantName: 'Rezaul Karim',
    applicantNID: '19786543210987654',
    loanAmount: 950000,
    loanPurpose: 'SME Expansion',
    mandatoryFields: [
      {
        fieldId: 'income_declaration',
        label: 'Monthly Income Declaration',
        value: '180000',
        isEmpty: false,
        confidence: 0.89,
      },
      {
        fieldId: 'asset_details',
        label: 'Asset Details',
        value: 'Warehouse and delivery van',
        isEmpty: false,
        confidence: 0.86,
      },
      {
        fieldId: 'reference_contact',
        label: 'Reference Contact',
        value: '01819-556677',
        isEmpty: false,
        confidence: 0.9,
      },
      {
        fieldId: 'employment_status',
        label: 'Employment Status',
        value: 'Entrepreneur',
        isEmpty: false,
        confidence: 0.85,
      },
      {
        fieldId: 'present_address',
        label: 'Present Address',
        value: 'Khilgaon, Dhaka',
        isEmpty: false,
        confidence: 0.83,
      },
    ],
    guarantorSection: {
      present: false,
      guarantorName: null,
      signaturePresent: false,
    },
    applicantSignature: true,
    dateOfApplication: todayIso,
  },
  signatureDetection: {
    signaturePresent: true,
    signatureZoneScore: 0.88,
    signaturePosition: {
      x: 0.67,
      y: 0.84,
      w: 0.23,
      h: 0.1,
    },
  },
  confidence: {
    overall: 0.82,
    perField: {
      applicantName: 0.9,
      applicantNID: 0.88,
      loanAmount: 0.93,
      loanPurpose: 0.84,
      guarantorName: 0.2,
    },
  },
  rawText: 'Loan form Rezaul Karim guarantor section not provided',
};
