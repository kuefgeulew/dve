import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { useScenario } from '../../hooks/useScenario';
import { useAppStore } from '../../store/appStore';
import type { DocumentType } from '../../types/document';

interface ScenarioSelectorProps {
  documentType: DocumentType;
}

export function ScenarioSelector({ documentType }: ScenarioSelectorProps) {
  const [collapsed, setCollapsed] = useState(true);
  const { mode } = useAppStore();
  const {
    scenarios,
    selectedScenarioId,
    activeScenario,
    selectScenario,
    resetToRandom,
    expectedWarningCount,
  } = useScenario(documentType);

  const dotColor = (badge: 'CLEAN' | 'WARNING' | 'CRITICAL'): string => {
    if (badge === 'CLEAN') return 'var(--status-pass)';
    if (badge === 'WARNING') return 'var(--severity-medium)';
    return 'var(--severity-high)';
  };

  const chipStyle = (active: boolean, badge: 'CLEAN' | 'WARNING' | 'CRITICAL') => ({
    padding: '8px 10px',
    borderRadius: 999,
    display: 'inline-flex',
    gap: 8,
    alignItems: 'center',
    border: active ? `1px solid ${dotColor(badge)}` : '1px solid var(--brand-border)',
    background: active
      ? badge === 'CLEAN'
        ? 'rgba(52, 211, 153, 0.15)'
        : badge === 'WARNING'
          ? 'rgba(255, 181, 71, 0.15)'
          : 'rgba(255, 77, 77, 0.15)'
      : 'var(--brand-surface-3)',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div
      style={{
        borderTop: '1px solid rgba(255,181,71,0.20)',
        background: 'rgba(255,181,71,0.04)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        style={{
          height: 48,
          width: '100%',
          border: 'none',
          background: 'transparent',
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          cursor: 'pointer',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <FlaskConical size={16} color="var(--severity-medium)" />
          <span>Scenario</span>
        </span>
        <ChevronDown
          size={16}
          style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.2s' }}
        />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: 12, display: 'grid', gap: 10 }}>
              {mode === 'RANDOM_MODE' ? (
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 12 }}>
                  Random mode active — scenarios disabled
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                    {scenarios.map((s) => (
                      <motion.button
                        key={s.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectScenario(s.id)}
                        style={chipStyle(selectedScenarioId === s.id, s.badge)}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: dotColor(s.badge),
                          }}
                        />
                        {s.label}
                      </motion.button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gap: 6 }}>
                    {activeScenario ? (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            Expected warnings: {expectedWarningCount}
                          </span>
                          <button
                            onClick={resetToRandom}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              color: 'var(--text-secondary)',
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                          >
                            Reset
                          </button>
                        </div>
                        {expectedWarningCount === 0 ? (
                          <span style={{ fontSize: 12, color: 'var(--status-pass)' }}>
                            ✓ No warnings expected
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {activeScenario.expectedWarningIds.map((id) => (
                              <span
                                key={id}
                                style={{
                                  fontSize: 11,
                                  borderRadius: 999,
                                  padding: '3px 8px',
                                  border: '1px solid var(--brand-border)',
                                  color: 'var(--text-secondary)',
                                }}
                              >
                                {id}
                              </span>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={resetToRandom}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: 12,
                            cursor: 'pointer',
                          }}
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
