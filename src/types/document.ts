export type DocumentType =
  | 'CHEQUE'
  | 'LOAN_FORM'
  | 'NID'
  | 'ACCOUNT_OPENING_FORM'
  | 'UNKNOWN';

export type WorkflowType =
  | 'cheque-processing'
  | 'loan-application'
  | 'kyc-verification';

export interface BoundingBox {
  x: number; // 0.0-1.0 relative to image width
  y: number; // 0.0-1.0 relative to image height
  w: number; // 0.0-1.0 relative to image width
  h: number; // 0.0-1.0 relative to image height
}
