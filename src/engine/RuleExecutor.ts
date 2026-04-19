import type { MockOCRResult, ValidationResult, ValidationRule } from '../types';

export function runAllRules(rules: ValidationRule[], ocrResult: MockOCRResult): ValidationResult[] {
  return rules.map((rule) => {
    const startTime = performance.now();
    try {
      const result = rule.validate(ocrResult);
      result.executionTimeMs = Number.parseFloat((performance.now() - startTime).toFixed(2));
      return result;
    } catch (error) {
      console.warn(`[DVE] Rule ${rule.id} threw an error:`, error);
      return {
        ruleId: rule.id,
        passed: true,
        warning: null,
        executionTimeMs: Number.parseFloat((performance.now() - startTime).toFixed(2)),
        executionError: String(error),
      };
    }
  });
}
