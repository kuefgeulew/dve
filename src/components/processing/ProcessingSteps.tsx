import { motion } from 'framer-motion';
import { ClipboardCheck, FileSearch, ScanLine, Shield, type LucideIcon } from 'lucide-react';
import { StepIndicator } from './StepIndicator';

interface ProcessingStepsProps {
  currentStep: number;
}

const STEPS: Array<{ id: number; label: string; icon: LucideIcon }> = [
  { id: 1, label: 'Document Classification', icon: ScanLine },
  { id: 2, label: 'Field Extraction (OCR)', icon: FileSearch },
  { id: 3, label: 'Validation Engine', icon: Shield },
  { id: 4, label: 'Report Generation', icon: ClipboardCheck },
];

function getStepState(stepId: number, currentStep: number): 'pending' | 'active' | 'complete' {
  if (currentStep > stepId) return 'complete';
  if (currentStep === stepId) return 'active';
  return 'pending';
}

export function ProcessingSteps({ currentStep }: ProcessingStepsProps) {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: 'easeOut',
        staggerChildren: 0.08,
      },
    },
  } as const;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        width: '100%',
      }}
    >
      {STEPS.map((step, index) => {
        const state = getStepState(step.id, currentStep);
        const nextStepActiveOrMore = currentStep >= step.id + 1;

        return (
          <div key={step.id} style={{ display: 'flex', flexDirection: 'column' }}>
            <StepIndicator stepNumber={step.id} label={step.label} status={state} />

            {index < STEPS.length - 1 && (
              <div style={{ height: 20, display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    width: 2,
                    height: 20,
                    background: nextStepActiveOrMore ? 'var(--brand-primary)' : 'var(--brand-border)',
                    transformOrigin: 'top',
                    overflow: 'hidden',
                  }}
                >
                  {nextStepActiveOrMore && (
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      style={{
                        width: '100%',
                        height: '100%',
                        background: 'var(--brand-primary)',
                        transformOrigin: 'top',
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </motion.div>
  );
}
