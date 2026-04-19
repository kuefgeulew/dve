import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_SCENARIOS } from '../../mock/mockScenarios';
import { useAppStore } from '../../store/appStore';
import { useDocumentStore } from '../../store/documentStore';
import type { DocumentType } from '../../types';
import { Button } from '../common/Button';

interface MockDocOption {
  type: DocumentType;
  label: string;
  assetPath: string;
  cleanDescription: string;
}

const MOCK_DOC_OPTIONS: MockDocOption[] = [
  {
    type: 'CHEQUE',
    label: 'Cheque',
    assetPath: '/assets/mock-documents/cheque-sample.svg',
    cleanDescription: 'Clean cheque',
  },
  {
    type: 'LOAN_FORM',
    label: 'Loan Form',
    assetPath: '/assets/mock-documents/loan-form-sample.svg',
    cleanDescription: 'Clean loan form',
  },
  {
    type: 'NID',
    label: 'NID',
    assetPath: '/assets/mock-documents/nid-sample.svg',
    cleanDescription: 'Clean NID',
  },
];

export function MockDocumentPicker() {
  const navigate = useNavigate();
  const mode = useAppStore((state) => state.mode);
  const selectedScenarioId = useDocumentStore((state) => state.selectedScenarioId);
  const currentDocumentType = useDocumentStore((state) => state.documentType);
  const setFile = useDocumentStore((state) => state.setFile);
  const setDocumentType = useDocumentStore((state) => state.setDocumentType);
  const clearScenario = useDocumentStore((state) => state.clearScenario);

  const activeScenario = useMemo(() => {
    if (!selectedScenarioId) return null;
    return MOCK_SCENARIOS[selectedScenarioId] ?? null;
  }, [selectedScenarioId]);

  if (mode !== 'STANDARD_MODE') return null;

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Use mock document</div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 2 }}>
        {MOCK_DOC_OPTIONS.map((option) => {
          const previewSrc =
            option.type === currentDocumentType &&
            activeScenario?.documentType === option.type &&
            activeScenario.mockAssetPath
              ? activeScenario.mockAssetPath
              : option.assetPath;
          return (
          <div
            key={option.type}
            style={{
              minWidth: 168,
              maxWidth: 168,
              borderRadius: 12,
              border: '1px solid var(--brand-border)',
              background: 'var(--brand-surface-2)',
              padding: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <img
              src={previewSrc}
              alt={`${option.label} sample`}
              style={{
                width: '100%',
                height: 86,
                objectFit: 'cover',
                borderRadius: 8,
                border: '1px solid var(--brand-border)',
                background: 'var(--brand-surface)',
              }}
            />
            <div style={{ display: 'grid', gap: 3 }}>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{option.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {option.type === currentDocumentType && activeScenario
                  ? activeScenario.label
                  : option.cleanDescription}
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={async () => {
                const path =
                  option.type === currentDocumentType &&
                  activeScenario?.documentType === option.type &&
                  activeScenario.mockAssetPath
                    ? activeScenario.mockAssetPath
                    : option.assetPath;
                const response: Response = await fetch(path);
                if (!response.ok) {
                  throw new Error(`Unable to load mock document: ${path}`);
                }
                const blob = await response.blob();
                const fileName = path.split('/').pop() ?? `${option.type.toLowerCase()}.svg`;
                const mime = blob.type || (path.endsWith('.png') ? 'image/png' : 'image/svg+xml');
                const file = new File([blob], fileName, { type: mime });

                setDocumentType(option.type);
                if (option.type !== currentDocumentType) clearScenario();
                setFile(file);

                window.setTimeout(() => {
                  navigate('/processing');
                }, 700);
              }}
            >
              Use This
            </Button>
          </div>
          );
        })}
      </div>
    </div>
  );
}
