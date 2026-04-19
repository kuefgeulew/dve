import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { DocumentValidationReport } from '../../types';
import { Button } from '../common/Button';

interface PassBannerProps {
  report: DocumentValidationReport;
}

export function PassBanner({ report }: PassBannerProps) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '100%',
        background: 'var(--brand-dark)',
        padding: '28px 20px 22px',
        display: 'grid',
        gridTemplateRows: '1fr auto',
      }}
    >
      <div style={{ display: 'grid', placeItems: 'center' }}>
        <div style={{ width: '100%', maxWidth: 320, display: 'grid', gap: 16, justifyItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            style={{ position: 'relative', width: 120, height: 120, display: 'grid', placeItems: 'center' }}
          >
            <div
              style={{
                position: 'absolute',
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, var(--status-pass-bg) 0%, transparent 50%)',
              }}
            />
            <svg viewBox="0 0 60 60" width="80" height="80" style={{ position: 'relative', zIndex: 1 }}>
              <circle cx="30" cy="30" r="28" fill="none" stroke="var(--status-pass)" strokeWidth="2.5" />
              <path
                d="M18 30 L26 38 L42 22"
                fill="none"
                stroke="var(--status-pass)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="40"
                strokeDashoffset="40"
              >
                <animate
                  attributeName="strokeDashoffset"
                  from="40"
                  to="0"
                  dur="0.6s"
                  begin="0.2s"
                  fill="freeze"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </path>
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: 'var(--status-pass)' }}
          >
            All Clear
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.18 }}
            style={{ color: 'var(--text-secondary)', fontSize: 15 }}
          >
            No issues detected
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.26, delay: 0.28 }}
            style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <StatChip text={`${report.totalRulesChecked} rules checked`} />
            <StatChip text={`OCR: ${Math.round(report.ocrConfidenceAverage * 100)}%`} />
            <StatChip text={report.documentType} />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, delay: 0.4 }}
      >
        <Button variant="primary" size="lg" fullWidth onClick={() => navigate('/')}>
          Proceed
        </Button>
      </motion.div>
    </div>
  );
}

function StatChip({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: '7px 10px',
        borderRadius: 999,
        border: '1px solid var(--brand-border)',
        background: 'var(--brand-surface-2)',
        fontSize: 12,
        color: 'var(--text-secondary)',
      }}
    >
      {text}
    </div>
  );
}
