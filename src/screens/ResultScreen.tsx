import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../App';
import { PassBanner } from '../components/validation/PassBanner';
import { WarningPanel } from '../components/validation/WarningPanel';
import { useValidationStore } from '../store/validationStore';

export default function ResultScreen() {
  const navigate = useNavigate();
  const { currentReport, isProcessing, processingError, currentLogEntryId } = useValidationStore();

  useEffect(() => {
    if (!currentReport && !isProcessing && processingError === null) {
      navigate('/');
    }
  }, [currentReport, isProcessing, processingError, navigate]);

  if (!currentReport) return null;

  return (
    <PageTransition>
      <div style={{ height: '100%', position: 'relative' }}>
        {currentReport.overallStatus === 'PASS' ? (
          <PassBanner report={currentReport} />
        ) : (
          <WarningPanel report={currentReport} currentLogEntryId={currentLogEntryId} />
        )}
      </div>
    </PageTransition>
  );
}
