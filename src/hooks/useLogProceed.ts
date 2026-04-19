/**
 * Called by ConfirmProceedScreen when operator clicks "Confirm & Submit".
 * Updates the existing log entry's operatorAction to PROCEEDED_WITH_WARNINGS.
 * Also marks all currently expanded/viewed warnings as acknowledged.
 */

import { useLogStore } from '../store/logStore';
import { useValidationStore } from '../store/validationStore';

export function useLogProceed() {
  const logStore = useLogStore();
  const validationStore = useValidationStore();

  function recordProceedDecision() {
    const { currentLogEntryId, currentReport } = validationStore;
    if (!currentLogEntryId) {
      console.warn('[DVE] useLogProceed called with no currentLogEntryId');
      return;
    }

    const proceedTimestamp = new Date().toISOString();

    // Update the entry action and timestamp
    logStore.updateEntryAction(
      currentLogEntryId,
      'PROCEEDED_WITH_WARNINGS',
      proceedTimestamp,
    );

    // Mark all warnings in the current report as acknowledged
    // (at confirmation time, operator has been shown the complete list)
    if (currentReport) {
      currentReport.warnings.forEach((w) => {
        logStore.markWarningAcknowledged(currentLogEntryId, w.ruleId);
      });
    }
  }

  return { recordProceedDecision };
}
