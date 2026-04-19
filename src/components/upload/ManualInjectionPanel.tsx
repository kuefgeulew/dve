import { motion } from 'framer-motion';
import { Wrench } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { ALL_RULES } from '../../engine/RuleRegistry';
import { useAppStore } from '../../store/appStore';
import { useDocumentStore } from '../../store/documentStore';
import { SeverityBadge } from '../validation/SeverityBadge';

export function ManualInjectionPanel() {
  const mode = useAppStore((state) => state.mode);
  const documentType = useDocumentStore((state) => state.documentType);
  const manualInjections = useDocumentStore((state) => state.manualInjections);
  const setManualInjections = useDocumentStore((state) => state.setManualInjections);

  const applicableRules = useMemo(
    () => ALL_RULES.filter((rule) => rule.documentTypes.includes(documentType)),
    [documentType],
  );

  const allowedIdSet = useMemo(() => new Set(applicableRules.map((rule) => rule.id)), [applicableRules]);

  const injectedRuleIds = useMemo(
    () => new Set(manualInjections.filter((id) => allowedIdSet.has(id))),
    [manualInjections, allowedIdSet],
  );

  useEffect(() => {
    const pruned = manualInjections.filter((id) => allowedIdSet.has(id));
    if (pruned.length !== manualInjections.length) {
      setManualInjections(pruned);
    }
  }, [allowedIdSet, manualInjections, setManualInjections]);

  if (mode !== 'MANUAL_MODE') return null;

  return (
    <div
      style={{
        borderTop: '1px solid var(--brand-border)',
        background: 'rgba(27, 111, 200, 0.08)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          minHeight: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          color: 'var(--text-primary)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Wrench size={16} color="#1B6FC8" />
          <span>Manual Error Injection</span>
        </span>
      </div>

      <div style={{ padding: 12, display: 'grid', gap: 10 }}>
        {applicableRules.map((rule) => {
          const enabled = injectedRuleIds.has(rule.id);
          return (
            <div
              key={rule.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 8,
                alignItems: 'center',
                border: '1px solid var(--brand-border)',
                borderRadius: 10,
                background: 'var(--brand-surface-2)',
                padding: '10px 12px',
              }}
            >
              <div style={{ minWidth: 0, display: 'grid', gap: 6 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{rule.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SeverityBadge severity={rule.severity} />
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {rule.id}
                  </span>
                </div>
              </div>
              <ToggleSwitch
                enabled={enabled}
                onClick={() => {
                  const next = new Set(manualInjections.filter((id) => allowedIdSet.has(id)));
                  if (next.has(rule.id)) next.delete(rule.id);
                  else next.add(rule.id);
                  setManualInjections(Array.from(next));
                }}
              />
            </div>
          );
        })}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-primary)',
              border: '1px solid var(--brand-border)',
              borderRadius: 999,
              background: 'var(--brand-surface-2)',
              padding: '5px 10px',
            }}
          >
            {`${injectedRuleIds.size} errors injected`}
          </span>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: 'none',
        background: enabled ? 'var(--brand-primary)' : 'var(--brand-surface-3)',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        transition: 'all 200ms ease',
        cursor: 'pointer',
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: enabled ? '#fff' : 'rgba(255,255,255,0.4)',
          transform: `translateX(${enabled ? 16 : 0}px)`,
          transition: 'all 200ms ease',
        }}
      />
    </motion.button>
  );
}
