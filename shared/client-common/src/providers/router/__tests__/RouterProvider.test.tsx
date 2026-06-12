import { ChakraProvider } from '@chakra-ui/react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import RouterProvider from '../RouterProvider';
import { system } from '@components';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// RouterProvider already has its own router, so we can't use renderWithProviders
// (which wraps with BrowserRouter). Only wrap with ChakraProvider and QueryClientProvider.
describe('RouterProvider', () => {
  it('should render router provider correctly', async () => {
    const { container } = render(
      <QueryClientProvider client={queryClient}>
        <ChakraProvider value={system}>
          <RouterProvider />
        </ChakraProvider>
      </QueryClientProvider>,
    );

    expect(container).toMatchSnapshot();
  });
});
