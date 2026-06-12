import { RouterProvider as RouterProviderReactDom } from 'react-router-dom';
import { getAppRouter } from '@routes';

const RouterProvider = () => {
  return <RouterProviderReactDom router={getAppRouter()} />;
};

export default RouterProvider;
