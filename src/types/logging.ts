import { type DocumentType } from './document';
import { type Severity } from './rules';

export type OperatorAction =
  | 'PROCEEDED_WITH_WARNINGS'
  | 'RETURNED_TO_REVIEW'
  | 'NO_WARNINGS';

export interface TriggeredWarning {
  ruleId: string;
  severity: Severity;
  message: string;
  acknowledged: boolean; // true when operator expanded or viewed this warning
}

export interface ErrorLogEntry {
  id: string;
  timestamp: string; // ISO 8601 - time of validation completion
  sessionId: string;
  operatorId: string;
  branchCode: string;
  workflowType: string;
  documentType: DocumentType;
  validationReportId: string;
  warnings: TriggeredWarning[];
  operatorAction: OperatorAction; // Set at decision time, not validation time
  acknowledgedWarningIds: string[]; // ruleIds of warnings operator interacted with
  proceedTimestamp: string | null; // ISO 8601 - time of "Confirm & Submit"
}

export interface ValidationStats {
  totalDocumentsProcessed: number;
  totalWarningsTriggered: number;
  warningsByRule: Record<string, number>;
  warningsByDocumentType: Record<string, number>;
  warningsBySeverity: {
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  proceedWithWarningsRate: number; // 0-100 percentage
  stpRate: number; // 0-100 percentage
  averageWarningsPerDocument: number;
  mostCommonWarning: string | null;
}

export interface TopError {
  ruleId: string;
  count: number;
  severity: Severity;
}

export type EvolutionStatus = 'PROPOSED' | 'IN_REVIEW' | 'APPROVED' | 'ACTIVE';

export interface EvolutionRecommendation {
  priority: number;
  proposedRuleId: string;
  rationale: string;
  estimatedFrequency: number;
  estimatedImpact: 'HIGH' | 'MEDIUM' | 'LOW';
  status: EvolutionStatus;
  phase: number;
}
