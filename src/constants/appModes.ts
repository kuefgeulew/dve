/**
 * Application operating modes - switchable via dev toolbar.
 *
 * DEMO_MODE   : Uses pre-set scenarios with predictable, repeatable outcomes.
 *               ScenarioSelector is visible. Default for prototype.
 *
 * RANDOM_MODE : mockOCR generates randomized field values and confidence scores.
 *               ScenarioSelector is hidden. Shows range of system behaviors.
 *
 * MANUAL_MODE : Operator selects which validation errors to inject via ManualInjectionPanel.
 *               The mock OCR layer applies targeted field mutations (e.g., amount mismatch,
 *               missing signature) on top of the clean baseline scenario for the active document type.
 *               Use for testing specific warning combinations.
 */

export type AppMode = 'STANDARD_MODE' | 'RANDOM_MODE' | 'MANUAL_MODE';

// Default to STANDARD_MODE so the prototype loads with scenario selection visible on first use.
export const DEFAULT_APP_MODE: AppMode = 'STANDARD_MODE';

export const APP_MODE_LABELS: Record<AppMode, string> = {
  STANDARD_MODE: 'Standard',
  RANDOM_MODE: 'Random',
  MANUAL_MODE: 'Manual',
};
