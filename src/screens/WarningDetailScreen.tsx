import { CheckCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageTransition } from '../App';
import { Button } from '../components/common/Button';
import { SeverityBadge } from '../components/validation/SeverityBadge';
import { useValidationStore } from '../store/validationStore';

export default function WarningDetailScreen() {
  const navigate = useNavigate();
  const { ruleId } = useParams<{ ruleId: string }>();
  const report = useValidationStore((state) => state.currentReport);
  const warning =
    ruleId !== undefined && ruleId !== ''
      ? report?.warnings.find((w) => w.ruleId === ruleId)
      : undefined;

  if (!warning) {
    return (
      <PageTransition>
        <div style={{ minHeight: '100%', background: 'var(--brand-dark)' }}>
          <div style={{ padding: 16, display: 'grid', gap: 14, alignContent: 'start' }}>
            <div
              style={{
                border: '1px solid var(--brand-border)',
                background: 'var(--brand-surface-2)',
                borderRadius: 'var(--radius-md)',
                padding: 14,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>Warning not found</h2>
              <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--text-secondary)' }}>
                The requested warning does not exist in the current validation report.
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={() => navigate('/result')}>
              Back to Results
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100%', background: 'var(--brand-dark)' }}>
        <div style={{ padding: 16, display: 'grid', gap: 12, alignContent: 'start' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <SeverityBadge severity={warning.severity} />
          </div>

          <h1
            style={{
              margin: 0,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
              fontSize: 24,
              lineHeight: 1.2,
            }}
          >
            {warning.title}
          </h1>

          <div
            style={{
              border: '1px solid var(--brand-border)',
              background: 'var(--brand-surface-2)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Full Message</div>
            <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>{warning.message}</div>
          </div>

          <div
            style={{
              border: '1px solid var(--brand-border)',
              background: 'var(--brand-surface)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              display: 'grid',
              gap: 8,
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Detail</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{warning.detail}</div>
          </div>

          {warning.affectedField ? (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-primary)',
                  border: '1px solid var(--brand-border)',
                  background: 'var(--brand-surface-2)',
                  borderRadius: 999,
                  padding: '6px 10px',
                }}
              >
                {`Field: ${warning.affectedField}`}
              </span>
            </div>
          ) : null}

          <div
            style={{
              border: '1px solid var(--brand-border)',
              background: 'var(--severity-medium-bg)',
              borderRadius: 'var(--radius-md)',
              padding: 14,
              display: 'flex',
              gap: 10,
              alignItems: 'flex-start',
            }}
          >
            <CheckCircle size={16} style={{ color: 'var(--severity-medium)', marginTop: 2, flexShrink: 0 }} />
            <div style={{ display: 'grid', gap: 6 }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Suggested Action</div>
              <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {warning.suggestedAction}
              </div>
            </div>
          </div>

          {warning.boundingBox !== null ? (
            <Button
              variant="secondary"
              size="md"
              onClick={() =>
                navigate('/result/review', {
                  state: { highlightRuleId: warning.ruleId },
                })
              }
            >
              View in Document
            </Button>
          ) : null}

          <Button variant="primary" size="md" onClick={() => navigate('/result/confirm')}>
            Proceed Anyway
          </Button>
        </div>
      </div>
    </PageTransition>
  );
}
