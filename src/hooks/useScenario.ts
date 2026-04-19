/**
 * Provides scenario selection logic for ScenarioSelector component.
 * Centralizes the relationship between scenario selection and document store updates.
 */

import { MOCK_SCENARIOS, getScenariosForDocumentType } from '../mock/mockScenarios';
import { useDocumentStore } from '../store/documentStore';
import type { DocumentType } from '../types/document';

export function useScenario(documentType: DocumentType) {
  const { selectedScenarioId, setScenario, clearScenario } = useDocumentStore();

  const scenarios = getScenariosForDocumentType(documentType);
  const activeScenario = selectedScenarioId ? MOCK_SCENARIOS[selectedScenarioId] : null;

  function selectScenario(id: string) {
    setScenario(id);
    const scenario = MOCK_SCENARIOS[id];
    if (scenario?.mockAssetPath) {
      // Auto-load the mock asset for this scenario
      fetch(scenario.mockAssetPath)
        .then((res) => res.blob())
        .then((blob) => {
          const fileName = scenario.mockAssetPath!.split('/').pop() ?? 'document.png';
          const file = new File([blob], fileName, { type: blob.type || 'image/png' });
          useDocumentStore.getState().setFile(file);
        })
        .catch((e) => console.error('Failed to load mock asset for scenario', e));
    }
  }

  function resetToRandom() {
    clearScenario();
  }

  return {
    scenarios,
    selectedScenarioId,
    activeScenario,
    selectScenario,
    resetToRandom,
    expectedWarningCount: activeScenario?.expectedWarningIds.length ?? 0,
  };
}
