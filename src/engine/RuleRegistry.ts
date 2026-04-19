import type { DocumentType, ValidationRule } from '../types';
import { amountMismatch } from '../rules/cheque/amountMismatch';
import { dateInvalid } from '../rules/cheque/dateInvalid';
import { dishonourClearingStampRule } from '../rules/cheque/dishonourClearingStamp';
import { payeeBlank } from '../rules/cheque/payeeBlank';
import { signatureMissing } from '../rules/cheque/signatureMissing';
import { guarantorMissing } from '../rules/loan/guarantorMissing';
import { mandatoryFields } from '../rules/loan/mandatoryFields';
import { expiryCheck } from '../rules/nid/expiryCheck';
import { imageQualityLow } from '../rules/nid/imageQualityLow';

/**
 * ALL_RULES is the source of truth for rule DEFINITIONS only.
 * Rule definitions here are static and never mutated at runtime.
 *
 * Enabled/disabled state is managed separately by ruleStore (src/store/ruleStore.ts).
 * getRulesForDocument receives enabledRuleIds from the caller (from ruleStore)
 * and filters here — it does NOT read from ruleStore directly.
 *
 * This separation ensures:
 *  - Pure functions in the engine layer (no store imports)
 *  - React re-renders only when ruleStore state changes (not on rule definition reads)
 *  - Rules can be unit-tested without any store setup
 */
export const ALL_RULES: ValidationRule[] = [
  amountMismatch,
  signatureMissing,
  dateInvalid,
  dishonourClearingStampRule,
  payeeBlank,
  mandatoryFields,
  guarantorMissing,
  imageQualityLow,
  expiryCheck,
];

export function getRuleById(id: string): ValidationRule | undefined {
  return ALL_RULES.find((r) => r.id === id);
}

export function getRulesForDocument(documentType: DocumentType, enabledRuleIds: string[]): ValidationRule[] {
  return ALL_RULES.filter(
    (r) => r.documentTypes.includes(documentType) && enabledRuleIds.includes(r.id),
  );
}
