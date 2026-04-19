import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

interface StepIndicatorProps {
  stepNumber: number;
  label: string;
  status: 'pending' | 'active' | 'complete';
  durationLabel?: string;
}

export function StepIndicator({ stepNumber, label, status, durationLabel }: StepIndicatorProps) {
  const textColor = status === 'pending' ? 'var(--text-secondary)' : 'var(--text-primary)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 20,
            height: 20,
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0,
          }}
          aria-label={`Step ${stepNumber} ${status}`}
        >
          {status === 'pending' && <Circle size={18} style={{ color: 'var(--text-secondary)' }} />}
          {status === 'active' && (
            <Loader2 size={18} className="animate-spin" style={{ color: 'var(--brand-primary)' }} />
          )}
          {status === 'complete' && <CheckCircle2 size={18} style={{ color: 'var(--brand-primary)' }} />}
        </div>

        {status === 'active' ? (
          <motion.span
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            style={{
              color: textColor,
              fontSize: 14,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </motion.span>
        ) : (
          <span
            style={{
              color: textColor,
              fontSize: 14,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </span>
        )}
      </div>

      {durationLabel ? (
        <span style={{ color: 'var(--text-muted)', fontSize: 12, flexShrink: 0 }}>{durationLabel}</span>
      ) : null}
    </motion.div>
  );
}
