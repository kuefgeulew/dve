import { animate, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  className?: string;
}

/** Counts up when `value` changes — for live stats and dashboards. */
export function AnimatedNumber({ value, decimals = 0, className }: AnimatedNumberProps) {
  const mv = useMotionValue(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const c = animate(mv, value, { duration: 1.05, ease: [0.22, 1, 0.36, 1] });
    return () => c.stop();
  }, [value, mv]);

  useMotionValueEvent(mv, 'change', (latest) => {
    if (!ref.current) return;
    ref.current.textContent =
      decimals > 0 ? latest.toFixed(decimals) : String(Math.round(latest));
  });

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      <span ref={ref}>{decimals > 0 ? Number(0).toFixed(decimals) : '0'}</span>
    </span>
  );
}
