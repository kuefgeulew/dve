/**
 * Dev toolbar rendered in the OUTER desktop environment (not inside the phone screen).
 * Allows switching between STANDARD_MODE, RANDOM_MODE, and MANUAL_MODE.
 * Only visible in the test context. Would not appear in production deployment.
 */

import { AlertTriangle, Check } from 'lucide-react';
import type { AppMode } from '../../constants/appModes';
import { APP_MODE_LABELS } from '../../constants/appModes';
import { useAppStore } from '../../store/appStore';

const MODES: AppMode[] = ['STANDARD_MODE', 'RANDOM_MODE', 'MANUAL_MODE'];

const TRACK_BG = 'rgba(226, 232, 242, 0.85)';
const INACTIVE_TEXT = '#64748B';
const ACTIVE_BG = 'var(--brand-primary)';

export function AppModeSwitcher() {
  const { mode, setMode } = useAppStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div
        role="tablist"
        aria-label="Standard mode"
        style={{
          display: 'flex',
          width: '100%',
          background: TRACK_BG,
          borderRadius: 999,
          padding: 3,
          boxSizing: 'border-box',
        }}
      >
        {MODES.map((m) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m)}
              style={{
                flex: 1,
                border: 'none',
                borderRadius: 999,
                padding: '8px 8px',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.02,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                background: active ? ACTIVE_BG : 'transparent',
                color: active ? '#FFFFFF' : INACTIVE_TEXT,
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              {APP_MODE_LABELS[m]}
            </button>
          );
        })}
      </div>
      {mode === 'RANDOM_MODE' && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#6b5428',
            background: 'var(--accent-gold-muted)',
            border: '1px solid rgba(201, 168, 108, 0.35)',
            padding: '5px 10px',
            borderRadius: 999,
            width: 'fit-content',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertTriangle size={14} color="#B45309" strokeWidth={2.2} aria-hidden />
          Unpredictable
        </span>
      )}
      {mode === 'MANUAL_MODE' && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: '#0F766E',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '5px 10px',
            borderRadius: 999,
            width: 'fit-content',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Check size={14} color="#0D9488" strokeWidth={2.5} aria-hidden />
          Field-level overrides enabled
        </span>
      )}
    </div>
  );
}
