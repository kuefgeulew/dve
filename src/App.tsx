import React, { Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { MobileContainer } from './components/layout/MobileContainer';

const HomeScreen = React.lazy(() => import('./screens/HomeScreen'));
const UploadScreen = React.lazy(() => import('./screens/UploadScreen'));
const ProcessingScreen = React.lazy(() => import('./screens/ProcessingScreen'));
const ResultScreen = React.lazy(() => import('./screens/ResultScreen'));
const WarningDetailScreen = React.lazy(() => import('./screens/WarningDetailScreen'));
const ReviewScreen = React.lazy(() => import('./screens/ReviewScreen'));
const ConfirmProceedScreen = React.lazy(() => import('./screens/ConfirmProceedScreen'));
const DashboardScreen = React.lazy(() => import('./screens/DashboardScreen'));
const RuleManagerScreen = React.lazy(() => import('./screens/RuleManagerScreen'));

export const PageTransition: React.FC<{ children: React.ReactNode; disableExit?: boolean }> = ({
  children,
  disableExit = false,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={disableExit ? undefined : { opacity: 0, y: -12 }}
    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    style={{ height: '100%' }}
  >
    {children}
  </motion.div>
);

function RootLayout() {
  return (
    <MobileContainer>
      <Suspense fallback={<div style={{ color: 'var(--text-muted)', padding: 20 }}>Loading...</div>}>
        <AnimatePresence mode="wait">
          <Outlet />
        </AnimatePresence>
      </Suspense>
    </MobileContainer>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'upload/:workflowType', element: <UploadScreen /> },
      { path: 'processing', element: <ProcessingScreen /> },
      { path: 'result', element: <ResultScreen /> },
      { path: 'result/warning/:ruleId', element: <WarningDetailScreen /> },
      { path: 'result/review', element: <ReviewScreen /> },
      { path: 'result/confirm', element: <ConfirmProceedScreen /> },
      { path: 'dashboard', element: <DashboardScreen /> },
      { path: 'dashboard/rules', element: <RuleManagerScreen /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
