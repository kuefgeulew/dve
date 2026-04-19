import { AlertTriangle, Files } from 'lucide-react';
import type { ValidationStats } from '../../types';
import { useCountUp } from '../../hooks/useCountUp';

interface StatsGridProps {
  stats: ValidationStats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  const docs = useCountUp(stats.totalDocumentsProcessed, 1200);
  const stp = useCountUp(stats.stpRate, 1200);
  const warnings = useCountUp(stats.totalWarningsTriggered, 1200);
  const proceedRate = useCountUp(stats.proceedWithWarningsRate, 1200);

  const stpColor =
    stats.stpRate >= 80
      ? 'var(--status-pass)'
      : stats.stpRate >= 50
        ? 'var(--severity-medium)'
        : 'var(--severity-high)';

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      <MetricCard
        label="Documents"
        value={`${Math.round(docs)}`}
        icon={<Files size={32} style={{ opacity: 0.15 }} />}
      />
      <MetricCard
        label="STP Rate"
        value={`${stp.toFixed(1)}%`}
        subtitle="clean submissions"
        valueColor={stpColor}
      />
      <MetricCard
        label="Warnings"
        value={`${Math.round(warnings)}`}
        icon={<AlertTriangle size={32} style={{ opacity: 0.15, color: 'var(--severity-medium)' }} />}
      />
      <MetricCard
        label="Proceed Rate"
        value={`${proceedRate.toFixed(0)}%`}
        subtitle="operators proceed w/ warnings"
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtitle,
  icon,
  valueColor = 'var(--text-primary)',
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        minHeight: 90,
        height: '100%',
        padding: 14,
        background: 'var(--brand-surface-2)',
        border: '1px solid var(--brand-border)',
        borderRadius: 'var(--radius-md)',
        position: 'relative',
        display: 'grid',
        gap: 6,
      }}
    >
      {icon ? (
        <div style={{ position: 'absolute', top: 10, right: 10, pointerEvents: 'none' }}>{icon}</div>
      ) : null}
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</div>
      <div style={{ fontSize: 24, fontFamily: 'var(--font-mono)', color: valueColor }}>{value}</div>
      {subtitle ? <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subtitle}</div> : null}
    </div>
  );
}
