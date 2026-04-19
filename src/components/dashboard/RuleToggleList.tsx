import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { useRuleStore } from '../../store/ruleStore';
import type { RuleCategory, ValidationRule } from '../../types';
import { SeverityBadge } from '../validation/SeverityBadge';

const CATEGORY_LABELS: Record<RuleCategory, string> = {
  AMOUNT_VALIDATION: 'Amount Validation',
  FIELD_COMPLETENESS: 'Field Completeness',
  SIGNATURE_DETECTION: 'Signature Detection',
  DATE_VALIDATION: 'Date Validation',
  IMAGE_QUALITY: 'Image Quality',
  IDENTITY_VERIFICATION: 'Identity Verification',
  FORMAT_CONSISTENCY: 'Format Consistency',
};

interface RuleToggleListProps {
  rules: ValidationRule[];
}

export function RuleToggleList({ rules }: RuleToggleListProps) {
  const enabledRuleIds = useRuleStore((state) => state.enabledRuleIds);
  const toggleRule = useRuleStore((state) => state.toggleRule);
  const [expandedId, setExpandedId] = useState<string | null>(rules[0]?.id ?? null);

  const grouped = useMemo(() => {
    const map = new Map<RuleCategory, ValidationRule[]>();
    for (const rule of rules) {
      const existing = map.get(rule.category) ?? [];
      existing.push(rule);
      map.set(rule.category, existing);
    }
    return Array.from(map.entries());
  }, [rules]);

  return (
    <div style={{ display: 'grid', gap: 0 }}>
      {grouped.map(([category, rules], groupIndex) => (
        <div key={category}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingTop: groupIndex === 0 ? 6 : 20,
              paddingBottom: 8,
            }}
          >
            {CATEGORY_LABELS[category]}
          </div>
          {rules.map((rule) => {
            const enabled = !!enabledRuleIds[rule.id];
            const expanded = expandedId === rule.id;
            return (
              <div
                key={rule.id}
                style={{
                  background: 'var(--brand-surface-2)',
                  border: '1px solid var(--brand-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 8,
                  overflow: 'hidden',
                }}
              >
                <motion.div whileTap={{ scale: 0.98 }} style={{ transformOrigin: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setExpandedId((prev) => (prev === rule.id ? null : rule.id))}
                    style={{
                      width: '100%',
                      border: 'none',
                      background: 'transparent',
                      display: 'grid',
                      gridTemplateColumns: '86px 1fr auto',
                      alignItems: 'center',
                      gap: 8,
                      padding: 12,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
                      {rule.id}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{rule.name}</div>
                      <span
                        style={{
                          display: 'inline-block',
                          marginTop: 4,
                          padding: '2px 7px',
                          borderRadius: 999,
                          border: '1px solid var(--brand-border)',
                          color: 'var(--text-secondary)',
                          fontSize: 10,
                        }}
                      >
                        {CATEGORY_LABELS[rule.category]}
                      </span>
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <ToggleSwitch enabled={enabled} onClick={() => toggleRule(rule.id)} />
                      <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} color="var(--text-secondary)" />
                      </motion.span>
                    </span>
                  </button>
                </motion.div>

                <AnimatePresence initial={false}>
                  {expanded ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div style={{ padding: '0 12px 12px', display: 'grid', gap: 8 }}>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {rule.description}
                        </p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                          {rule.documentTypes.map((docType) => (
                            <span key={docType} style={chipStyle}>
                              {docType}
                            </span>
                          ))}
                          <SeverityBadge severity={rule.severity} />
                          <span style={chipStyle}>Phase {rule.phase} Rule</span>
                        </div>
                        {!enabled ? (
                          <div
                            style={{
                              color: 'var(--severity-medium)',
                              background: 'var(--severity-medium-bg)',
                              border: '1px solid var(--severity-medium-border)',
                              borderRadius: 8,
                              padding: '8px 10px',
                              fontSize: 12,
                            }}
                          >
                            This rule is currently inactive. Warnings for {rule.name} will not be generated.
                          </div>
                        ) : null}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function ToggleSwitch({ enabled, onClick }: { enabled: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
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

const chipStyle: CSSProperties = {
  fontSize: 10,
  color: 'var(--text-secondary)',
  background: 'var(--brand-surface-3)',
  border: '1px solid var(--brand-border)',
  borderRadius: 999,
  padding: '2px 7px',
};
