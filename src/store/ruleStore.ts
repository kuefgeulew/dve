/**
 * RuleStore — manages runtime enable/disable state for validation rules.
 * Supplements the static `enabled` flag on ValidationRule definitions.
 *
 * Architecture note: introduced alongside appStore, documentStore, validationStore,
 * and logStore; blueprint §12 once described three stores, but rule governance
 * requires this additional store separate from static `ALL_RULES` in RuleRegistry.
 */

import { create } from 'zustand';
import { ALL_RULES } from '../engine/RuleRegistry';

interface RuleStore {
  // Map of ruleId -> enabled boolean
  enabledRuleIds: Record<string, boolean>;
  toggleRule: (ruleId: string) => void;
  enableAll: () => void;
  disableAll: () => void;
  getEnabledIds: () => string[];
}

export const useRuleStore = create<RuleStore>((set, get) => ({
  enabledRuleIds: ALL_RULES.reduce(
    (acc, rule) => ({ ...acc, [rule.id]: rule.enabled }),
    {} as Record<string, boolean>,
  ),

  toggleRule: (ruleId) =>
    set((state) => ({
      enabledRuleIds: {
        ...state.enabledRuleIds,
        [ruleId]: !state.enabledRuleIds[ruleId],
      },
    })),

  enableAll: () =>
    set({
      enabledRuleIds: Object.fromEntries(ALL_RULES.map((r) => [r.id, true])),
    }),

  disableAll: () =>
    set({
      enabledRuleIds: Object.fromEntries(ALL_RULES.map((r) => [r.id, false])),
    }),

  getEnabledIds: () => {
    const { enabledRuleIds } = get();
    return Object.entries(enabledRuleIds)
      .filter(([, v]) => v)
      .map(([k]) => k);
  },
}));
