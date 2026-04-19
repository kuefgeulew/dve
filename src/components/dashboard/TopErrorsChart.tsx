import { motion } from 'framer-motion';
import type { TopError } from '../../types';

interface TopErrorsChartProps {
  topErrors: TopError[];
}

const RULE_LABELS: Record<string, string> = {
  CHQ_AMOUNT_MISMATCH: 'Amount Mismatch',
  CHQ_SIGNATURE_MISSING: 'Missing Signature',
  CHQ_DATE_INVALID: 'Invalid Date',
  CHQ_PAYEE_BLANK: 'Blank Payee',
  LOAN_MANDATORY_FIELDS: 'Incomplete Fields',
  LOAN_GUARANTOR_MISSING: 'No Guarantor',
  NID_IMAGE_QUALITY: 'NID Quality',
  NID_EXPIRY: 'NID Expired',
};

const SEVERITY_BAR_COLOR = {
  HIGH: 'var(--severity-high)',
  MEDIUM: 'var(--severity-medium)',
  LOW: 'var(--severity-low)',
} as const;

export function TopErrorsChart({ topErrors }: TopErrorsChartProps) {
  const maxCount = Math.max(1, ...topErrors.map((item) => item.count));

  return (
    <section style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ fontSize: 14, color: 'var(--text-heading)' }}>Most Frequent Issues</h3>
      <div style={{ display: 'grid', gap: 10 }}>
        {topErrors.map((item, index) => {
          const widthPercent = (item.count / maxCount) * 100;
          return (
            <div key={item.ruleId} style={{ display: 'grid', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                  {RULE_LABELS[item.ruleId] ?? item.ruleId}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 8px',
                    borderRadius: 999,
                    border: '1px solid var(--brand-border)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {item.count}
                </span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: 8,
                  background: 'var(--brand-surface-3)',
                  borderRadius: 4,
                  overflow: 'hidden',
                }}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.1 }}
                  style={{
                    height: '100%',
                    borderRadius: 4,
                    background: SEVERITY_BAR_COLOR[item.severity],
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
