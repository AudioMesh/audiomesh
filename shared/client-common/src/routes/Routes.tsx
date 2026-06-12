import {
  Navigate,
  Route,
  createHashRouter,
  createRoutesFromChildren,
} from 'react-router-dom';
import { LazyDashboardPage } from './lazyScreens/publicScreens';

export const getAppRouter = () => {
  return createHashRouter(
    createRoutesFromChildren(
      <>
        <Route path="/" element={<LazyDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </>,
    ),
  );
};
