/**
 * Provides read access to log data for components.
 * Separates log reads from log writes (useLogProceed handles writes).
 */

import { useLogStore } from '../store/logStore';

export function useErrorLog() {
  const logStore = useLogStore();

  return {
    entries: logStore.entries,
    stats: logStore.getStats(),
    topErrors: logStore.getTopErrors(5),
    evolutionRecommendations: logStore.getEvolutionRecommendations(),
    recentEntries: logStore.entries.slice(-10).reverse(),
  };
}
