import { create } from 'zustand';
import type { DocumentValidationReport, MockOCRResult } from '../types';

type ProcessingStep = 0 | 1 | 2 | 3 | 4;

interface ValidationStore {
  isProcessing: boolean;
  processingStep: ProcessingStep;
  currentReport: DocumentValidationReport | null;
  currentOCRResult: MockOCRResult | null;
  currentLogEntryId: string | null;
  processingError: string | null;

  startProcessing: () => void;
  setProcessingStep: (step: ProcessingStep) => void;
  setResult: (report: DocumentValidationReport, ocrResult: MockOCRResult | null) => void;
  setCurrentLogEntryId: (id: string) => void;
  setError: (error: string) => void;
  clearResult: () => void;
}

export const useValidationStore = create<ValidationStore>((set) => ({
  isProcessing: false,
  processingStep: 0,
  currentReport: null,
  currentOCRResult: null,
  currentLogEntryId: null,
  processingError: null,

  startProcessing: () => set({ isProcessing: true, processingStep: 0, processingError: null }),
  setProcessingStep: (processingStep) => set({ processingStep }),
  setResult: (currentReport, currentOCRResult) =>
    set({ currentReport, currentOCRResult, isProcessing: false }),
  setCurrentLogEntryId: (currentLogEntryId) => set({ currentLogEntryId }),
  setError: (processingError) => set({ processingError, isProcessing: false }),
  clearResult: () =>
    set({ currentReport: null, currentOCRResult: null, processingStep: 0, currentLogEntryId: null }),
}));
