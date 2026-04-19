import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageTransition } from '../App';
import { DocumentTypeSelector } from '../components/upload/DocumentTypeSelector';
import { DropZone } from '../components/upload/DropZone';
import { ManualInjectionPanel } from '../components/upload/ManualInjectionPanel';
import { ScenarioSelector } from '../components/common/ScenarioSelector';
import { useAppStore } from '../store/appStore';
import { useDocumentStore } from '../store/documentStore';
import type { DocumentType, WorkflowType } from '../types';

export default function UploadScreen() {
  const { workflowType } = useParams();
  const { mode } = useAppStore();
  const {
    setWorkflow,
    documentType,
    workflowType: activeWorkflowType,
    setDocumentType,
    clearScenario,
  } = useDocumentStore();

  useEffect(() => {
    if (workflowType) setWorkflow(workflowType as WorkflowType);
  }, [workflowType, setWorkflow]);

  return (
    <PageTransition>
      <div style={{ height: '100%', position: 'relative' }}>
        <div style={{ padding: 14, display: 'grid', gap: 12 }}>
          <DocumentTypeSelector
            value={documentType}
            disabled={activeWorkflowType !== null}
            onChange={(type: DocumentType) => {
              setDocumentType(type);
              clearScenario();
            }}
          />
          {mode === 'STANDARD_MODE' && <ScenarioSelector documentType={documentType} />}
          {mode === 'MANUAL_MODE' && <ManualInjectionPanel />}
          <DropZone documentType={documentType} />
        </div>
      </div>
    </PageTransition>
  );
}
