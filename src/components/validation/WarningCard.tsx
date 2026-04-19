import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Warning } from '../../types';
import { useLogStore } from '../../store/logStore';
import { Button } from '../common/Button';
import { SeverityBadge } from './SeverityBadge';

interface WarningCardProps {
  warning: Warning;
  defaultExpanded: boolean;
  logEntryId: string | null;
}

const SEVERITY_ACCENT: Record<Warning['severity'], string> = {
  HIGH: 'var(--severity-high)',
  MEDIUM: 'var(--severity-medium)',
  LOW: 'var(--severity-low)',
};

export function WarningCard({ warning, defaultExpanded, logEntryId }: WarningCardProps) {
  const navigate = useNavigate();
  const markWarningAcknowledged = useLogStore((state) => state.markWarningAcknowledged);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [showHighShimmer, setShowHighShimmer] = useState(warning.severity === 'HIGH');

  useEffect(() => {
    if (warning.severity !== 'HIGH') return;
    const timer = window.setTimeout(() => setShowHighShimmer(false), 1000);
    return () => window.clearTimeout(timer);
  }, [warning.severity]);

  useEffect(() => {
    if (!expanded || !logEntryId) return;
    markWarningAcknowledged(logEntryId, warning.ruleId);
  }, [expanded, logEntryId, warning.ruleId, markWarningAcknowledged]);

  return (
    <div
      style={{
        background: 'var(--brand-surface-2)',
        border: '1px solid var(--brand-border)',
        borderLeft: `4px solid ${SEVERITY_ACCENT[warning.severity]}`,
        borderRadius: 'var(--radius-md)',
        marginBottom: 10,
        padding: 12,
        animation: showHighShimmer ? 'severity-shimmer 1s ease-in-out 1' : undefined,
      }}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded((prev) => !prev)}
        style={{
          width: '100%',
          minHeight: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          textAlign: 'left',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <SeverityBadge severity={warning.severity} />
          <span
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {warning.title}
          </span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} style={{ color: 'var(--text-secondary)' }} />
        </motion.div>
      </motion.button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 10, display: 'grid', gap: 10 }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)' }}>{warning.message}</p>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{warning.detail}</p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--severity-medium-bg)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  color: 'var(--severity-medium)',
                }}
              >
                <Lightbulb size={14} />
                <span style={{ fontSize: 13 }}>{warning.suggestedAction}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                {warning.boundingBox !== null ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate('/result/review', { state: { highlightRuleId: warning.ruleId } })
                    }
                  >
                    View in Document →
                  </Button>
                ) : null}
                <button
                  type="button"
                  onClick={() => navigate(`/result/warning/${warning.ruleId}`)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    padding: '4px 0',
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Details →
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
