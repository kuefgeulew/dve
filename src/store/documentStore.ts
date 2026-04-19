import { create } from 'zustand';
import type { DocumentType, WorkflowType } from '../types';

interface DocumentStore {
  selectedFile: File | null;
  documentType: DocumentType;
  selectedScenarioId: string | null;
  manualInjections: string[];
  imagePreviewUrl: string | null;
  workflowType: WorkflowType | null;

  setFile: (file: File) => void;
  setDocumentType: (type: DocumentType) => void;
  setScenario: (scenarioId: string) => void;
  clearScenario: () => void;
  setManualInjections: (ids: string[]) => void;
  setWorkflow: (workflow: WorkflowType) => void;
  clearDocument: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  selectedFile: null,
  documentType: 'CHEQUE',
  selectedScenarioId: null,
  manualInjections: [],
  imagePreviewUrl: null,
  workflowType: null,

  setFile: (file) => {
    const existing = get().imagePreviewUrl;
    if (existing) URL.revokeObjectURL(existing);
    set({ selectedFile: file, imagePreviewUrl: URL.createObjectURL(file) });
  },

  setDocumentType: (documentType) => set({ documentType }),

  setScenario: (selectedScenarioId) => set({ selectedScenarioId }),

  clearScenario: () => set({ selectedScenarioId: null }),

  setManualInjections: (manualInjections) => set({ manualInjections }),

  setWorkflow: (workflowType) => {
    const typeMap: Record<WorkflowType, DocumentType> = {
      'cheque-processing': 'CHEQUE',
      'loan-application': 'LOAN_FORM',
      'kyc-verification': 'NID',
    };
    set({ workflowType, documentType: typeMap[workflowType], selectedScenarioId: null, manualInjections: [] });
  },

  clearDocument: () => {
    const existing = get().imagePreviewUrl;
    if (existing) URL.revokeObjectURL(existing);
    set({ selectedFile: null, imagePreviewUrl: null, selectedScenarioId: null, manualInjections: [] });
  },
}));
