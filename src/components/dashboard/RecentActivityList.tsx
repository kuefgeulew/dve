import type { ErrorLogEntry } from '../../types';
import { timeAgo } from '../../utils/timeAgo';

interface RecentActivityListProps {
  entries: ErrorLogEntry[];
}

const DOC_CHIP_STYLES: Record<ErrorLogEntry['documentType'], { bg: string; color: string }> = {
  CHEQUE: { bg: 'rgba(27, 111, 200, 0.1)', color: 'var(--text-heading)' },
  LOAN_FORM: { bg: 'rgba(245, 166, 35, 0.16)', color: 'var(--text-heading)' },
  NID: { bg: 'rgba(15, 118, 110, 0.1)', color: 'var(--status-pass)' },
  ACCOUNT_OPENING_FORM: { bg: 'rgba(13, 43, 94, 0.08)', color: 'var(--text-heading)' },
  UNKNOWN: { bg: 'rgba(100, 116, 139, 0.12)', color: 'var(--text-secondary)' },
};

export function RecentActivityList({ entries }: RecentActivityListProps) {
  return (
    <section style={{ display: 'grid', gap: 10 }}>
      <h3 style={{ fontSize: 14, color: 'var(--text-heading)' }}>Recent Activity (last {entries.length})</h3>
      <div style={{ display: 'grid', gap: 8 }}>
        {entries.map((entry) => {
          const clean = entry.operatorAction === 'NO_WARNINGS' || entry.warnings.length === 0;
          const chip = DOC_CHIP_STYLES[entry.documentType];

          return (
            <div
              key={entry.id}
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                alignItems: 'center',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--brand-surface-2)',
                border: '1px solid var(--brand-border)',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  padding: '3px 7px',
                  borderRadius: 999,
                  background: chip.bg,
                  color: chip.color,
                  fontWeight: 600,
                }}
              >
                {entry.documentType}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{entry.branchCode}</span>
              <span style={{ fontSize: 12, color: clean ? 'var(--status-pass)' : 'var(--severity-medium)' }}>
                {clean ? '✓ Clean' : `${entry.warnings.length} warnings`}
              </span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{timeAgo(entry.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
