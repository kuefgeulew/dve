import { useLocation, useParams } from 'react-router-dom';
import type { BracAppBarProps } from './BracAppBar';

const WORKFLOW_TITLES: Record<string, string> = {
  'cheque-processing': 'Cheque Processing',
  'loan-application': 'Loan Application',
  'kyc-verification': 'KYC Verification',
};

/** Route-driven titles and back navigation for the in-device BRAC app bar. */
export function useBracAppBarRoute(): BracAppBarProps {
  const { pathname } = useLocation();
  const params = useParams();

  if (pathname === '/') {
    return { title: 'Document Validation Engine', showBack: false, backTo: '/' };
  }
  if (pathname.startsWith('/upload/')) {
    const w = params.workflowType ?? 'cheque-processing';
    return { title: WORKFLOW_TITLES[w] ?? 'Upload', showBack: true, backTo: '/' };
  }
  if (pathname === '/processing') {
    return { title: 'Processing', showBack: false, backTo: '/' };
  }
  if (pathname === '/result') {
    return { title: 'Validation Result', showBack: true, backTo: '/' };
  }
  if (pathname.startsWith('/result/warning/')) {
    return { title: 'Warning Detail', showBack: true, backTo: '/result' };
  }
  if (pathname === '/result/review') {
    return { title: 'Document Review', showBack: true, backTo: '/result' };
  }
  if (pathname === '/result/confirm') {
    return { title: 'Confirm Proceed', showBack: true, backTo: '/result' };
  }
  if (pathname === '/dashboard/rules') {
    return { title: 'Rule Manager', subtitle: 'Phase 1 — 8 Active Rules', showBack: true, backTo: '/dashboard' };
  }
  if (pathname === '/dashboard') {
    return { title: 'Analytics', subtitle: 'Validation Engine Insights', showBack: true, backTo: '/' };
  }
  return { title: 'Document Validation Engine', showBack: false, backTo: '/' };
}
