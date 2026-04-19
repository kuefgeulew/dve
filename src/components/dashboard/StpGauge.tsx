import { useEffect, useState } from 'react';

interface StpGaugeProps {
  stpRate: number;
}

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StpGauge({ stpRate }: StpGaugeProps) {
  const clamped = Math.max(0, Math.min(100, stpRate));
  const [animatedRate, setAnimatedRate] = useState(0);

  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimatedRate(clamped));
    return () => cancelAnimationFrame(id);
  }, [clamped]);

  const arcColor =
    stpRate >= 80
      ? 'var(--status-pass)'
      : stpRate >= 50
        ? 'var(--severity-medium)'
        : 'var(--severity-high)';

  return (
    <section
      style={{
        display: 'grid',
        justifyItems: 'center',
        gap: 8,
        padding: 14,
        background: 'var(--brand-surface-2)',
        border: '1px solid var(--brand-border)',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="56" fill="none" stroke="var(--brand-surface-3)" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r="56"
          fill="none"
          stroke={arcColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE - (animatedRate / 100) * CIRCUMFERENCE}
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1.4s ease' }}
        />
        <text
          x="70"
          y="66"
          textAnchor="middle"
          fill="var(--text-primary)"
          fontSize="22"
          fontFamily="var(--font-mono)"
          fontWeight="500"
        >
          {clamped.toFixed(0)}%
        </text>
        <text x="70" y="84" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontFamily="var(--font-body)">
          STP Rate
        </text>
      </svg>
      <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>documents processed without warnings</p>
    </section>
  );
}
