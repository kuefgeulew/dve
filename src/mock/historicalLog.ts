import type { DocumentType } from '../types/document';
import type { ErrorLogEntry, TriggeredWarning } from '../types/logging';
import type { Severity } from '../types/rules';

/** Synthetic operator / branch IDs (blueprint-style naming). */
const OPERATOR_IDS = ['OP-DHK-017', 'OP-CTG-042', 'OP-SYL-108', 'OP-KHL-221', 'OP-RJH-054', 'OP-DHA-901'] as const;
const BRANCH_CODES = ['BRAC-CTG-003', 'BR-DHK-017', 'BRAC-SYL-011', 'BR-KHL-023', 'BR-RJH-008', 'BRAC-DHA-014'] as const;

/** Align severities with `ValidationRule` definitions in RuleRegistry. */
const RULE_SEVERITY: Record<string, Severity> = {
  CHQ_AMOUNT_MISMATCH: 'HIGH',
  CHQ_SIGNATURE_MISSING: 'HIGH',
  CHQ_DATE_INVALID: 'MEDIUM',
  CHQ_PAYEE_BLANK: 'HIGH',
  LOAN_MANDATORY_FIELDS: 'HIGH',
  LOAN_GUARANTOR_MISSING: 'MEDIUM',
  NID_IMAGE_QUALITY: 'MEDIUM',
  NID_EXPIRY: 'LOW',
};

const CHEQUE_RULES = ['CHQ_AMOUNT_MISMATCH', 'CHQ_SIGNATURE_MISSING', 'CHQ_DATE_INVALID', 'CHQ_PAYEE_BLANK'] as const;
const LOAN_RULES = ['LOAN_MANDATORY_FIELDS', 'LOAN_GUARANTOR_MISSING'] as const;
const NID_RULES = ['NID_IMAGE_QUALITY', 'NID_EXPIRY'] as const;

/** One row per rule so all 8 rule IDs appear at least once in `warnings`. */
const COVERAGE_ROWS: Array<{
  documentType: DocumentType;
  workflowType: string;
  ruleId: string;
}> = [
  { documentType: 'CHEQUE', workflowType: 'cheque-processing', ruleId: 'CHQ_AMOUNT_MISMATCH' },
  { documentType: 'CHEQUE', workflowType: 'cheque-processing', ruleId: 'CHQ_SIGNATURE_MISSING' },
  { documentType: 'CHEQUE', workflowType: 'cheque-processing', ruleId: 'CHQ_DATE_INVALID' },
  { documentType: 'CHEQUE', workflowType: 'cheque-processing', ruleId: 'CHQ_PAYEE_BLANK' },
  { documentType: 'LOAN_FORM', workflowType: 'loan-application', ruleId: 'LOAN_MANDATORY_FIELDS' },
  { documentType: 'LOAN_FORM', workflowType: 'loan-application', ruleId: 'LOAN_GUARANTOR_MISSING' },
  { documentType: 'NID', workflowType: 'kyc-verification', ruleId: 'NID_IMAGE_QUALITY' },
  { documentType: 'NID', workflowType: 'kyc-verification', ruleId: 'NID_EXPIRY' },
];

function workflowFor(documentType: DocumentType): string {
  if (documentType === 'CHEQUE') return 'cheque-processing';
  if (documentType === 'LOAN_FORM') return 'loan-application';
  return 'kyc-verification';
}

function pickRulePool(documentType: DocumentType): readonly string[] {
  if (documentType === 'CHEQUE') return CHEQUE_RULES;
  if (documentType === 'LOAN_FORM') return LOAN_RULES;
  return NID_RULES;
}

/**
 * Operator action mix (50 rows): ≥30% PROCEEDED_WITH_WARNINGS, ≥25% NO_WARNINGS, remainder RETURNED_TO_REVIEW.
 * 16 / 50 = 32% proceeded, 13 / 50 = 26% no warnings, 21 / 50 = 42% returned.
 */
function getOperatorAction(index: number): ErrorLogEntry['operatorAction'] {
  if (index < 16) return 'PROCEEDED_WITH_WARNINGS';
  if (index < 29) return 'NO_WARNINGS';
  return 'RETURNED_TO_REVIEW';
}

function buildWarningsForCoverage(
  ruleId: string,
  action: ErrorLogEntry['operatorAction'],
  seed: number,
): TriggeredWarning[] {
  if (action === 'NO_WARNINGS') return [];
  const severity = RULE_SEVERITY[ruleId] ?? 'MEDIUM';
  const acknowledged = action === 'PROCEEDED_WITH_WARNINGS' && seed % 2 === 0;
  return [
    {
      ruleId,
      severity,
      message: `${ruleId} triggered during validation`,
      acknowledged,
    },
  ];
}

function buildWarningsMixed(
  index: number,
  action: ErrorLogEntry['operatorAction'],
  documentType: DocumentType,
): TriggeredWarning[] {
  if (action === 'NO_WARNINGS') return [];

  const pool = pickRulePool(documentType);
  const count = (index % 3) + 1;
  const warnings: TriggeredWarning[] = [];

  for (let i = 0; i < count; i += 1) {
    const ruleId = pool[(index + i) % pool.length] ?? pool[0];
    const severity = RULE_SEVERITY[ruleId] ?? 'MEDIUM';
    const acknowledgedBase = ((index + i * 3) % 10) < 6;
    const acknowledged = action === 'PROCEEDED_WITH_WARNINGS' ? acknowledgedBase : false;

    warnings.push({
      ruleId,
      severity,
      message: `${ruleId} triggered during validation`,
      acknowledged,
    });
  }

  return warnings;
}

/** Spread timestamps across the last ~90 days with deterministic jitter. */
function buildTimestamp(index: number): Date {
  const now = new Date();
  const daysBack = (index * 37 + 11) % 90;
  const ts = new Date(now);
  ts.setDate(ts.getDate() - daysBack);
  ts.setHours((index * 7) % 24, (index * 13) % 60, (index * 3) % 60, 0);
  return ts;
}

/** 50+ seeded rows: workflows, all rule IDs, mixed operator outcomes. */
export const historicalLog: ErrorLogEntry[] = Array.from({ length: 50 }, (_, index) => {
  const entryIndex = index + 1;
  const id = `hist-${String(entryIndex).padStart(3, '0')}`;
  const operatorAction = getOperatorAction(index);
  const timestampDate = buildTimestamp(index);

  let documentType: DocumentType;
  let workflowType: string;
  let warnings: TriggeredWarning[];

  if (index < 8) {
    const row = COVERAGE_ROWS[index]!;
    documentType = row.documentType;
    workflowType = row.workflowType;
    warnings = buildWarningsForCoverage(row.ruleId, operatorAction, index);
  } else if (index < 16) {
    const cycle = index % 3;
    documentType = cycle === 0 ? 'CHEQUE' : cycle === 1 ? 'LOAN_FORM' : 'NID';
    workflowType = workflowFor(documentType);
    warnings = buildWarningsMixed(index, operatorAction, documentType);
  } else if (index < 29) {
    const cycle = index % 3;
    documentType = cycle === 0 ? 'CHEQUE' : cycle === 1 ? 'LOAN_FORM' : 'NID';
    workflowType = workflowFor(documentType);
    warnings = [];
  } else {
    const cycle = index % 3;
    documentType = cycle === 0 ? 'CHEQUE' : cycle === 1 ? 'LOAN_FORM' : 'NID';
    workflowType = workflowFor(documentType);
    warnings = buildWarningsMixed(index, operatorAction, documentType);
  }

  const acknowledgedWarningIds = warnings.filter((w) => w.acknowledged).map((w) => w.ruleId);
  const proceedTimestamp =
    operatorAction === 'PROCEEDED_WITH_WARNINGS'
      ? new Date(timestampDate.getTime() + 10 * 60 * 1000).toISOString()
      : null;

  return {
    id,
    timestamp: timestampDate.toISOString(),
    sessionId: 'historical-session',
    operatorId: OPERATOR_IDS[index % OPERATOR_IDS.length]!,
    branchCode: BRANCH_CODES[index % BRANCH_CODES.length]!,
    workflowType,
    documentType,
    validationReportId: `report-${String(entryIndex).padStart(3, '0')}`,
    warnings,
    operatorAction,
    acknowledgedWarningIds,
    proceedTimestamp,
  };
});
