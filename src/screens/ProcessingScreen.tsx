import { useEffect, useMemo, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../App';
import { Button } from '../components/common/Button';
import { ProcessingSteps } from '../components/processing/ProcessingSteps';
import { useDocumentValidation } from '../hooks/useDocumentValidation';
import { useDocumentStore } from '../store/documentStore';
import { useValidationStore } from '../store/validationStore';

const STEP_SUBTITLES: Record<number, string> = {
  1: 'Identifying document type...',
  2: 'Extracting text and field values...',
  3: 'Running 8 validation checks...',
  4: 'Compiling analysis report...',
};

export default function ProcessingScreen() {
  const navigate = useNavigate();
  const { runValidationPipeline } = useDocumentValidation();
  const { documentType, workflowType } = useDocumentStore();
  const { processingStep, processingError } = useValidationStore();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;
    void runValidationPipeline();
  }, [runValidationPipeline]);

  const subtitle = useMemo(() => STEP_SUBTITLES[processingStep] ?? STEP_SUBTITLES[1], [processingStep]);

  if (processingError) {
    return (
      <PageTransition disableExit>
        <div
          style={{
            position: 'relative',
            height: '100%',
            background: 'var(--brand-dark)',
            padding: '40px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 400,
              height: 400,
              position: 'absolute',
              top: -100,
              left: -100,
              background: 'radial-gradient(circle, var(--brand-glow) 0%, transparent 60%)',
              filter: 'blur(24px)',
              animation: 'breathe 2.5s infinite alternate',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: 300,
              border: '1px solid var(--brand-border)',
              borderRadius: 16,
              background: 'var(--bg-card)',
              padding: 20,
              display: 'grid',
              gap: 14,
              textAlign: 'center',
            }}
          >
            <AlertTriangle size={40} style={{ color: 'var(--brand-secondary)', marginBottom: 16 }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24 }}>Processing Failed</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{processingError}</p>
            <Button
              variant="primary"
              size="md"
              fullWidth
              onClick={() =>
                navigate(workflowType !== null ? `/upload/${workflowType}` : '/')
              }
            >
              Try Again
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition disableExit>
      <div
        style={{
          position: 'relative',
          height: '100%',
          background: 'var(--brand-dark)',
          overflow: 'hidden',
          padding: '24px 20px 20px',
        }}
      >
        <div
          style={{
            width: 400,
            height: 400,
            position: 'absolute',
            top: -100,
            left: -100,
            background: 'radial-gradient(circle, var(--brand-glow) 0%, transparent 60%)',
            filter: 'blur(24px)',
            animation: 'breathe 2.5s infinite alternate',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, height: '100%', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
          <div
            style={{
              textAlign: 'center',
              paddingTop: 80,
              display: 'grid',
              justifyItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                borderRadius: 999,
                background: 'var(--brand-surface-2)',
                border: '1px solid var(--brand-border)',
                color: 'var(--text-heading)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: 0.6,
                padding: '6px 12px',
              }}
            >
              {documentType}
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: 'var(--text-heading)' }}>
              Analyzing Document
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{subtitle}</p>
          </div>

          <div style={{ alignSelf: 'center', marginTop: 16 }}>
            <ProcessingSteps currentStep={processingStep} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
