import { ALL_RULES } from './RuleRegistry';
import type { ErrorLogEntry, EvolutionRecommendation, TopError, ValidationStats } from '../types';

export function getEvolutionRecommendations(): EvolutionRecommendation[] {
  return [
    {
      priority: 1,
      proposedRuleId: 'CHQ_ENDORSEMENT_MISSING',
      rationale:
        'Multi-party cheques missing endorsement signatures detected in 12% of cheque warnings. Highest unaddressed failure type.',
      estimatedImpact: 'HIGH',
      estimatedFrequency: 340,
      status: 'IN_REVIEW',
      phase: 2,
    },
    {
      priority: 2,
      proposedRuleId: 'CHQ_CROSSING_MARKS',
      rationale:
        'A/C payee crossing validation absent. Required for compliance with BB circular on crossed cheques.',
      estimatedFrequency: 210,
      estimatedImpact: 'MEDIUM',
      status: 'PROPOSED',
      phase: 2,
    },
    {
      priority: 3,
      proposedRuleId: 'LOAN_INCOME_DECLARATION',
      rationale:
        'Income declaration section blank in 8% of loan forms. BRPD Circular 14 mandatory field.',
      estimatedFrequency: 180,
      estimatedImpact: 'HIGH',
      status: 'APPROVED',
      phase: 2,
    },
    {
      priority: 4,
      proposedRuleId: 'NID_PHOTO_OBSCURED',
      rationale:
        'Photo region quality/presence check. NID with obscured photo passes current quality check but fails manual review.',
      estimatedFrequency: 95,
      estimatedImpact: 'MEDIUM',
      status: 'PROPOSED',
      phase: 3,
    },
    {
      priority: 5,
      proposedRuleId: 'CHQ_TAMPERING_DETECTION',
      rationale:
        'Phase 3 ML target. Color inconsistency and font change detection. Requires trained CV model.',
      estimatedFrequency: 40,
      estimatedImpact: 'HIGH',
      status: 'PROPOSED',
      phase: 3,
    },
  ];
}

export function getTopErrors(entries: ErrorLogEntry[], limit = 5): TopError[] {
  const warningsByRule: Record<string, number> = {};

  for (const entry of entries) {
    for (const warning of entry.warnings) {
      warningsByRule[warning.ruleId] = (warningsByRule[warning.ruleId] ?? 0) + 1;
    }
  }

  return Object.entries(warningsByRule)
    .map(([ruleId, count]) => {
      const rule = ALL_RULES.find((r) => r.id === ruleId);
      return { ruleId, count, severity: rule?.severity ?? 'MEDIUM' };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function aggregateStats(entries: ErrorLogEntry[]): ValidationStats {
  const total = entries.length;
  if (total === 0) {
    return {
      totalDocumentsProcessed: 0,
      totalWarningsTriggered: 0,
      warningsByRule: {},
      warningsByDocumentType: {},
      warningsBySeverity: { HIGH: 0, MEDIUM: 0, LOW: 0 },
      proceedWithWarningsRate: 0,
      stpRate: 0,
      averageWarningsPerDocument: 0,
      mostCommonWarning: null,
    };
  }

  const warningsByRule: Record<string, number> = {};
  const warningsByDocumentType: Record<string, number> = {};
  const warningsBySeverity = { HIGH: 0, MEDIUM: 0, LOW: 0 };
  let totalWarnings = 0;
  let stpCount = 0;
  let proceededCount = 0;
  let returnedCount = 0;

  for (const entry of entries) {
    warningsByDocumentType[entry.documentType] = (warningsByDocumentType[entry.documentType] ?? 0) + 1;

    if (entry.operatorAction === 'NO_WARNINGS') stpCount += 1;
    if (entry.operatorAction === 'PROCEEDED_WITH_WARNINGS') proceededCount += 1;
    if (entry.operatorAction === 'RETURNED_TO_REVIEW') returnedCount += 1;

    for (const warning of entry.warnings) {
      warningsByRule[warning.ruleId] = (warningsByRule[warning.ruleId] ?? 0) + 1;
      warningsBySeverity[warning.severity] = (warningsBySeverity[warning.severity] ?? 0) + 1;
      totalWarnings += 1;
    }
  }

  const decisionTotal = proceededCount + returnedCount;
  const mostCommonEntry = Object.entries(warningsByRule).sort((a, b) => b[1] - a[1])[0];

  return {
    totalDocumentsProcessed: total,
    totalWarningsTriggered: totalWarnings,
    warningsByRule,
    warningsByDocumentType,
    warningsBySeverity,
    proceedWithWarningsRate:
      decisionTotal > 0 ? Number.parseFloat(((proceededCount / decisionTotal) * 100).toFixed(1)) : 0,
    stpRate: Number.parseFloat(((stpCount / total) * 100).toFixed(1)),
    averageWarningsPerDocument: Number.parseFloat((totalWarnings / total).toFixed(2)),
    mostCommonWarning: mostCommonEntry ? mostCommonEntry[0] : null,
  };
}
