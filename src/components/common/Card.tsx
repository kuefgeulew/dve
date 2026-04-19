import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
}

export function Card({ children }: CardProps) {
  return <div className="brand-card glass-panel">{children}</div>;
}
