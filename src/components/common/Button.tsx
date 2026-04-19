import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  disabled?: boolean;
}

const sizeMap = {
  sm: { padding: '8px 12px', fontSize: 12 },
  md: { padding: '10px 14px', fontSize: 14 },
  lg: { padding: '12px 16px', fontSize: 15 },
} as const;

const variantMap = {
  primary: {
    background: 'var(--brand-primary)',
    color: '#fff',
    border: '1px solid var(--brand-primary)',
  },
  danger: {
    background: 'var(--button-danger-bg)',
    color: '#fff',
    border: '1px solid var(--button-danger-border)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--text-primary)',
    border: '1px solid var(--brand-border)',
  },
  ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
} as const;

export function Button({
  variant,
  size,
  fullWidth = false,
  icon,
  loading = false,
  onClick,
  children,
  disabled = false,
}: ButtonProps) {
  const locked = disabled || loading;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={locked}
      style={{
        ...sizeMap[size],
        ...variantMap[variant],
        width: fullWidth ? '100%' : undefined,
        borderRadius: 12,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: locked ? 'not-allowed' : 'pointer',
        opacity: locked ? 0.7 : 1,
      }}
    >
      {icon}
      {loading ? 'Loading...' : children}
    </motion.button>
  );
}
