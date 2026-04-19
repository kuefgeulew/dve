import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { DocumentValidationReport } from '../../types';
import { Button } from '../common/Button';
import { WarningCard } from './WarningCard';

interface WarningPanelProps {
  report: DocumentValidationReport;
  currentLogEntryId: string | null;
}

const SEVERITY_DOT_COLOR = {
  HIGH: 'var(--severity-high)',
  MEDIUM: 'var(--severity-medium)',
  LOW: 'var(--severity-low)',
} as const;

export function WarningPanel({ report, currentLogEntryId }: WarningPanelProps) {
  const navigate = useNavigate();
  const issueCount = report.warningCount;

  const severityCounts = useMemo(
    () =>
      report.warnings.reduce(
        (acc, warning) => {
          acc[warning.severity] += 1;
          return acc;
        },
        { HIGH: 0, MEDIUM: 0, LOW: 0 },
      ),
    [report.warnings],
  );

  return (
    <div style={{ height: '100%', background: 'var(--brand-dark)', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div style={{ padding: '22px 20px 12px', display: 'grid', gap: 10 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text-heading)' }}>
          {issueCount} Issue{issueCount > 1 ? 's' : ''} Detected
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Review before proceeding</p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {severityCounts.HIGH > 0 && (
            <SeverityChip
              label={`${severityCounts.HIGH} Critical`}
              dotColor={SEVERITY_DOT_COLOR.HIGH}
              background="var(--severity-high-bg)"
              borderColor="var(--severity-high-border)"
            />
          )}
          {severityCounts.MEDIUM > 0 && (
            <SeverityChip
              label={`${severityCounts.MEDIUM} Medium`}
              dotColor={SEVERITY_DOT_COLOR.MEDIUM}
              background="var(--severity-medium-bg)"
              borderColor="var(--severity-medium-border)"
            />
          )}
          {severityCounts.LOW > 0 && (
            <SeverityChip
              label={`${severityCounts.LOW} Low`}
              dotColor={SEVERITY_DOT_COLOR.LOW}
              background="var(--severity-low-bg)"
              borderColor="var(--severity-low-border)"
            />
          )}
        </div>
      </div>

      <div
        className="phone-scroll-content"
        style={{ minHeight: 0, overflowY: 'auto', padding: '4px 20px 0', position: 'relative' }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {report.warnings.map((warning, index) => (
            <motion.div
              key={warning.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.22, ease: 'easeOut' }}
            >
              <WarningCard
                warning={warning}
                defaultExpanded={warning.severity === 'HIGH'}
                logEntryId={currentLogEntryId}
              />
            </motion.div>
          ))}
        </motion.div>

        <div
          style={{
            position: 'sticky',
            bottom: 0,
            marginTop: 8,
            padding: '16px 20px 20px',
            marginLeft: -20,
            marginRight: -20,
            background:
              'linear-gradient(to top, var(--brand-dark) calc(100% - 16px), rgba(244, 247, 251, 0) 100%), var(--brand-dark)',
            display: 'grid',
            gap: 10,
          }}
        >
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            icon={<Shield size={16} />}
            onClick={() => navigate('/result/review')}
          >
            Review Document
          </Button>
          <Button
            variant="danger"
            size="lg"
            fullWidth
            icon={<ArrowRight size={16} />}
            onClick={() => navigate('/result/confirm')}
          >
            Proceed Anyway →
          </Button>
          <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
            Proceeding is logged for compliance
          </p>
        </div>
      </div>
    </div>
  );
}

function SeverityChip({
  label,
  dotColor,
  background,
  borderColor,
}: {
  label: string;
  dotColor: string;
  background: string;
  borderColor: string;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        padding: '6px 10px',
        borderRadius: 999,
        border: `1px solid ${borderColor}`,
        background,
        fontSize: 12,
        color: 'var(--text-primary)',
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '999px', background: dotColor }} />
      {label}
    </div>
  );
}
