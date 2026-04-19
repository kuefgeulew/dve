import type { CSSProperties, ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Badge({ children, style }: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        padding: '3px 8px',
        fontSize: 11,
        borderRadius: 999,
        border: '1px solid var(--brand-border)',
        color: 'var(--text-secondary)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}
