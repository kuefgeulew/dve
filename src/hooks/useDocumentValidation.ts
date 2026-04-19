/**
 * CRITICAL ARCHITECTURE NOTE on operatorAction logging:
 *
 * This hook writes a log entry at validation completion with action 'NO_WARNINGS'
 * (for clean documents) or a PENDING state (for documents with warnings).
 *
 * For documents WITH warnings, the operatorAction is initially logged as
 * 'RETURNED_TO_REVIEW' (conservative default) and is updated to
 * 'PROCEEDED_WITH_WARNINGS' by useLogProceed() when the operator confirms.
 *
 * This ensures the log accurately reflects actual operator behavior,
 * not assumed behavior.
 *
 * The log entry ID is stored in validationStore so downstream hooks can reference it.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { runValidation } from '../engine/ValidationEngine';
import { mockClassify } from '../mock/mockClassifier';
import { mockOCRExtract } from '../mock/mockOCR';
import { useAppStore } from '../store/appStore';
import { useDocumentStore } from '../store/documentStore';
import { useLogStore } from '../store/logStore';
import { useRuleStore } from '../store/ruleStore';
import { useValidationStore } from '../store/validationStore';
import { simulateDelay } from '../utils/delay';
import { generateId } from '../utils/idGenerator';
import type { DocumentValidationReport } from '../types';

export function useDocumentValidation() {
  const navigate = useNavigate();

  const runValidationPipeline = useCallback(async () => {
    const documentStore = useDocumentStore.getState();
    const validationStore = useValidationStore.getState();
    const logStore = useLogStore.getState();
    const ruleStore = useRuleStore.getState();
    const appStore = useAppStore.getState();

    const { selectedFile, documentType, selectedScenarioId, workflowType, manualInjections } = documentStore;

    validationStore.startProcessing();

    try {
      // STEP 1: Classify document type (simulated)
      validationStore.setProcessingStep(1);
      await mockClassify(documentType);

      // STEP 2: Extract fields via mock OCR
      validationStore.setProcessingStep(2);
      const ocrResult = await mockOCRExtract(
        selectedFile,
        documentType,
        selectedScenarioId ?? undefined,
        appStore.mode,
        manualInjections,
      );

      // STEP 3: Run validation rules (synchronous, but add UX pause)
      validationStore.setProcessingStep(3);
      await simulateDelay(350, 500);
      const enabledIds = ruleStore.getEnabledIds();
      const report = runValidation(ocrResult, documentType, enabledIds);

      // STEP 4: Finalize report
      validationStore.setProcessingStep(4);
      await simulateDelay(250, 350);
      validationStore.setResult(report, ocrResult);

      // Log the validation event.
      // For NO_WARNINGS: log immediately as final.
      // For WARNINGS: log with conservative action 'RETURNED_TO_REVIEW'.
      //   This will be updated to 'PROCEEDED_WITH_WARNINGS' by useLogProceed()
      //   if the operator confirms. If they navigate away without confirming,
      //   'RETURNED_TO_REVIEW' remains — which is accurate.
      const logEntryId = logStore.addEntry({
        operatorId: appStore.operatorId,
        branchCode: appStore.branchCode,
        workflowType: workflowType ?? 'unknown',
        documentType,
        validationReportId: report.id,
        warnings: report.warnings.map((w) => ({
          ruleId: w.ruleId,
          severity: w.severity,
          message: w.message,
          acknowledged: false,
        })),
        operatorAction: report.warningCount === 0 ? 'NO_WARNINGS' : 'RETURNED_TO_REVIEW',
        acknowledgedWarningIds: [],
        proceedTimestamp: null,
      });

      // Store the log entry ID for downstream use
      validationStore.setCurrentLogEntryId(logEntryId);

      navigate('/result');
    } catch (error) {
      // NEVER let a pipeline error crash the app.
      // Build a fallback report so ResultScreen can still render warnings.
      console.warn('[DVE] Validation pipeline error:', error);
      validationStore.setError(String(error));

      const { documentType: fallbackDocType, workflowType: fallbackWorkflow } = useDocumentStore.getState();

      const fallbackReport: DocumentValidationReport = {
        id: generateId(),
        timestamp: new Date().toISOString(),
        documentType: fallbackDocType,
        imageQuality: { overallScore: 0, lighting: 0, blur: 1, skew: 0 },
        ocrConfidenceAverage: 0,
        totalRulesChecked: 0,
        passedCount: 0,
        warningCount: 1,
        warnings: [
          {
            id: generateId(),
            ruleId: 'SYSTEM_PIPELINE_ERROR',
            ruleName: 'Pipeline Error',
            severity: 'HIGH',
            title: 'Validation Could Not Complete',
            message: 'The document validation pipeline encountered an error. Manual review is required.',
            detail: String(error),
            affectedField: null,
            boundingBox: null,
            suggestedAction: 'Re-upload the document or proceed to manual review.',
          },
        ],
        overallStatus: 'WARNINGS',
        canProceed: true,
      };

      validationStore.setResult(fallbackReport, null);

      const fallbackLogEntryId = logStore.addEntry({
        operatorId: appStore.operatorId,
        branchCode: appStore.branchCode,
        workflowType: fallbackWorkflow ?? 'unknown',
        documentType: fallbackDocType,
        validationReportId: fallbackReport.id,
        warnings: fallbackReport.warnings.map((w) => ({
          ruleId: w.ruleId,
          severity: w.severity,
          message: w.message,
          acknowledged: false,
        })),
        operatorAction: 'RETURNED_TO_REVIEW',
        acknowledgedWarningIds: [],
        proceedTimestamp: null,
      });

      validationStore.setCurrentLogEntryId(fallbackLogEntryId);
      navigate('/result');
    }
  }, [navigate]);

  return { runValidationPipeline };
}
