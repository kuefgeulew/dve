import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageTransition } from '../App';
import { AnnotatedImageOverlay } from '../components/validation/AnnotatedImageOverlay';
import { useDocumentStore } from '../store/documentStore';
import { useValidationStore } from '../store/validationStore';

export default function ReviewScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentReport, currentOCRResult } = useValidationStore();
  const { documentType } = useDocumentStore();
  /** When undefined (e.g. opened from footer “Review Document”), all boxes render at full emphasis. */
  const highlightRuleId = (location.state as { highlightRuleId?: string } | null)?.highlightRuleId;

  useEffect(() => {
    if (!currentReport) navigate('/');
  }, [currentReport, navigate]);

  if (!currentReport) return null;

  const resolvedDocumentType = currentOCRResult?.documentType ?? currentReport.documentType ?? documentType;

  return (
    <PageTransition>
      <div style={{ minHeight: '100%', background: 'var(--brand-dark)' }}>
        <div style={{ padding: 12 }}>
          <AnnotatedImageOverlay
            documentType={resolvedDocumentType}
            warnings={currentReport.warnings}
            highlightRuleId={highlightRuleId}
          />
        </div>
      </div>
    </PageTransition>
  );
}
