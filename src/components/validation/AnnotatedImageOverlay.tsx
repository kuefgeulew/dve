import { motion } from 'framer-motion';
import type { DocumentType, Warning } from '../../types';
import { useDocumentStore } from '../../store/documentStore';

interface AnnotatedImageOverlayProps {
  documentType: DocumentType;
  warnings: Warning[];
  highlightRuleId?: string;
}

const SEVERITY_COLOR = {
  HIGH: 'var(--severity-high)',
  MEDIUM: 'var(--severity-medium)',
  LOW: 'var(--severity-low)',
} as const;

const SEVERITY_TINT = {
  HIGH: 'rgba(255, 77, 77, 0.08)',
  MEDIUM: 'rgba(255, 181, 71, 0.08)',
  LOW: 'rgba(91, 141, 239, 0.08)',
} as const;

const DOCUMENT_IMAGE_MAP: Record<DocumentType, string> = {
  CHEQUE: '/assets/mock-documents/cheque-sample.svg',
  LOAN_FORM: '/assets/mock-documents/loan-form-sample.svg',
  NID: '/assets/mock-documents/nid-sample.svg',
  ACCOUNT_OPENING_FORM: '/assets/mock-documents/loan-form-sample.svg',
  UNKNOWN: '/assets/mock-documents/cheque-sample.svg',
};

export function AnnotatedImageOverlay({
  documentType,
  warnings,
  highlightRuleId,
}: AnnotatedImageOverlayProps) {
  const imagePreviewUrl = useDocumentStore((state) => state.imagePreviewUrl);
  const boxedWarnings = warnings.filter((warning) => warning.boundingBox !== null);
  const baseImageSrc = imagePreviewUrl ?? DOCUMENT_IMAGE_MAP[documentType];
  const hasHighlightTarget = Boolean(highlightRuleId);

  return (
    <div style={{ width: '100%', display: 'grid', gap: 10 }}>
      <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <img
            src={baseImageSrc}
            alt="Document"
            style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 8 }}
          />
        </div>

        <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
          {boxedWarnings.map((warning, index) => {
            const box = warning.boundingBox;
            if (!box) return null;
            const color = SEVERITY_COLOR[warning.severity];
            const isFocused = hasHighlightTarget && highlightRuleId === warning.ruleId;
            const dimmed = hasHighlightTarget && !isFocused;
            const labelBelow = box.y < 0.1;

            return (
              <motion.div
                key={warning.id}
                initial={{ opacity: 0 }}
                animate={
                  isFocused
                    ? {
                        opacity: 1,
                        boxShadow: [
                          `0 0 0 0 ${color}, 0 0 8px 2px ${color}`,
                          `0 0 0 0 ${color}, 0 0 14px 3px ${color}`,
                          `0 0 0 0 ${color}, 0 0 8px 2px ${color}`,
                        ],
                      }
                    : { opacity: dimmed ? 0.42 : 1 }
                }
                transition={
                  isFocused
                    ? {
                        opacity: { duration: 0.25, delay: index * 0.1 },
                        boxShadow: { duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' },
                      }
                    : { duration: 0.25, delay: index * 0.1 }
                }
                style={{
                  position: 'absolute',
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.w * 100}%`,
                  height: `${box.h * 100}%`,
                  border: `${isFocused ? 2.5 : 2}px solid ${color}`,
                  background: SEVERITY_TINT[warning.severity],
                  borderRadius: 4,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    ...(labelBelow
                      ? { top: 'calc(100% + 4px)', left: 0 }
                      : { bottom: 'calc(100% + 4px)', left: 0 }),
                    minWidth: 100,
                    maxWidth: 180,
                    background: 'rgba(0,0,0,0.85)',
                    borderRadius: 4,
                    padding: '3px 8px',
                    color: '#fff',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    opacity: dimmed ? 0.85 : 1,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '999px',
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  {warning.title}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          border: '1px solid var(--brand-border)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--brand-surface-2)',
          padding: 8,
        }}
      >
        {boxedWarnings.map((warning) => {
          const dimLegend =
            hasHighlightTarget && highlightRuleId !== warning.ruleId;
          return (
            <div
              key={`${warning.id}-legend`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                color: 'var(--text-secondary)',
                opacity: dimLegend ? 0.45 : 1,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '999px',
                  background: SEVERITY_COLOR[warning.severity],
                }}
              />
              {warning.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}
