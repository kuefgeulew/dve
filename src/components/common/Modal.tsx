import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'grid',
        placeItems: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 320,
          background: 'var(--brand-surface)',
          border: '1px solid var(--brand-border)',
          borderRadius: 14,
          padding: 16,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <strong>{title}</strong>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
