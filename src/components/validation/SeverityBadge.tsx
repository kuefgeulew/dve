import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Severity } from '../../types';

interface SeverityBadgeProps {
  severity: Severity;
}

const CONFIG = {
  HIGH: {
    label: 'Critical',
    icon: AlertTriangle,
    color: 'var(--severity-high)',
    background: 'var(--severity-high-bg)',
    border: 'var(--severity-high-border)',
  },
  MEDIUM: {
    label: 'Medium',
    icon: AlertCircle,
    color: 'var(--severity-medium)',
    background: 'var(--severity-medium-bg)',
    border: 'var(--severity-medium-border)',
  },
  LOW: {
    label: 'Low',
    icon: Info,
    color: 'var(--severity-low)',
    background: 'var(--severity-low-bg)',
    border: 'var(--severity-low-border)',
  },
} as const;

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = CONFIG[severity];
  const Icon = config.icon;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 8px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        color: config.color,
        background: config.background,
        border: `1px solid ${config.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}
