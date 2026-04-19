import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../App';
import { Button } from '../components/common/Button';
import { useLogProceed } from '../hooks/useLogProceed';
import { useDocumentStore } from '../store/documentStore';
import { useValidationStore } from '../store/validationStore';

export default function ConfirmProceedScreen() {
  const navigate = useNavigate();
  const { recordProceedDecision } = useLogProceed();
  const clearDocument = useDocumentStore((s) => s.clearDocument);
  const { currentReport } = useValidationStore();
  const [submitted, setSubmitted] = useState(false);

  const warningCount = currentReport?.warningCount ?? 0;
  const warnings = currentReport?.warnings ?? [];

  async function onConfirm() {
    recordProceedDecision();
    setSubmitted(true);
    window.setTimeout(() => {
      clearDocument();
      navigate('/');
    }, 1500);
  }

  return (
    <PageTransition>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          minHeight: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% -20%, rgba(201, 168, 108, 0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          style={{
            width: '100%',
            maxWidth: 340,
            margin: 'auto',
            background: 'var(--brand-surface-2)',
            border: '1px solid var(--brand-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 28,
            display: 'grid',
            gap: 14,
            textAlign: 'center',
          }}
        >
          {submitted ? (
            <>
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <CheckCircle2 size={40} style={{ color: 'var(--status-pass)' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Document submitted successfully</h2>
            </>
          ) : (
            <>
              <div style={{ display: 'grid', placeItems: 'center' }}>
                <AlertTriangle size={40} style={{ color: 'var(--severity-medium)' }} />
              </div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 22 }}>Proceed with Warnings?</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.45 }}>
                You are submitting this document with {warningCount} unresolved issue
                {warningCount === 1 ? '' : 's'}. This action is recorded for compliance review.
              </p>

              <div
                style={{
                  background: 'var(--brand-surface-3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                  display: 'grid',
                  gap: 6,
                  textAlign: 'left',
                }}
              >
                {warnings.map((warning) => (
                  <div
                    key={warning.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: 'var(--text-primary)' }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '999px',
                        background:
                          warning.severity === 'HIGH'
                            ? 'var(--severity-high)'
                            : warning.severity === 'MEDIUM'
                              ? 'var(--severity-medium)'
                              : 'var(--severity-low)',
                      }}
                    />
                    {warning.title}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Ref: Bangladesh Bank DFS Guidelines 2020 — audit trail requirement
              </p>

              <div style={{ display: 'grid', gap: 8 }}>
                <Button variant="secondary" size="md" fullWidth onClick={() => navigate(-1)}>
                  Go Back
                </Button>
                <Button variant="danger" size="md" fullWidth onClick={onConfirm}>
                  Confirm & Submit
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
