import { useLocation } from 'react-router-dom';

/** System-style gesture pill (mirrors modern phone home indicator). */
export function PhoneHomeIndicator() {
  const path = useLocation().pathname;
  const hidden =
    path === '/processing' ||
    path === '/result/confirm' ||
    path === '/result/review' ||
    path.startsWith('/result/warning/');

  if (hidden) return null;

  return <div className="phone-home-indicator" aria-hidden />;
}
