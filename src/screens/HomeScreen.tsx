import { motion } from 'framer-motion';
import { Banknote, ChevronRight, ClipboardList, ShieldCheck, FileText, FileSpreadsheet, type LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageTransition } from '../App';

const WORKFLOWS: Array<{
  to: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}> = [
  {
    to: '/upload/cheque-processing',
    title: 'Cheque Processing',
    subtitle: 'Amounts, signatures, and payee checks for cheque images.',
    icon: Banknote,
  },
  {
    to: '/upload/loan-application',
    title: 'Loan Application',
    subtitle: 'Mandatory fields, guarantor blocks, and form completeness.',
    icon: ClipboardList,
  },
  {
    to: '/upload/kyc-verification',
    title: 'KYC Verification',
    subtitle: 'NID quality, expiry, and identity consistency screening.',
    icon: ShieldCheck,
  },
  {
    to: '#',
    title: 'Account Opening Form',
    subtitle: 'Signature cards, nominee details, and initial deposit checks.',
    icon: FileText,
  },
  {
    to: '#',
    title: 'Trade Finance',
    subtitle: 'LCs, Bills of Lading, and commercial invoice validation.',
    icon: FileSpreadsheet,
  },
];

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.065, delayChildren: 0.08 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HomeScreen() {
  return (
    <PageTransition>
      <motion.div
        className="home-screen-layout"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.p
          variants={staggerItem}
          style={{
            margin: 0,
            color: 'var(--text-secondary)',
            fontSize: 13,
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: '0.01em',
          }}
        >
          Choose a workflow to begin validation.
        </motion.p>
        {WORKFLOWS.map((wf) => (
          <motion.div key={wf.to} variants={staggerItem}>
            <WorkflowCard {...wf} />
          </motion.div>
        ))}
      </motion.div>
    </PageTransition>
  );
}

function WorkflowCard({
  to,
  title,
  subtitle,
  icon: Icon,
}: {
  to: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <Link to={to} className="workflow-card">
      <span className="workflow-card-accent" aria-hidden />
      <div className="workflow-card-icon-wrap">
        <Icon size={22} strokeWidth={2} aria-hidden />
      </div>
      <div className="workflow-card-body">
        <p className="workflow-card-title">{title}</p>
        <p className="workflow-card-subtitle">{subtitle}</p>
      </div>
      <div className="workflow-card-chevron">
        <ChevronRight size={22} strokeWidth={2.25} aria-hidden />
      </div>
    </Link>
  );
}
