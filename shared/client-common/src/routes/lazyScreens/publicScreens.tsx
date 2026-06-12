import { LazyProvider } from '@providers';
import { lazy } from 'react';

// Dashboard screen
const DashboardPage = lazy(() => import('@screens/dashboard/Dashboard'));

export const LazyDashboardPage = () => (
  <LazyProvider>
    <DashboardPage />
  </LazyProvider>
);
