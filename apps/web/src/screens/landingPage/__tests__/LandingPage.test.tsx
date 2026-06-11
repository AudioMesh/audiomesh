import { screen } from '@testing-library/react';
import { renderWithRouter } from '@testUtils';
import LandingPage from '../LandingPage';

describe('LandingPage', () => {
  it('should render correctly for guest user', () => {
    const { container } = renderWithRouter(<LandingPage />);

    expect(container).toMatchSnapshot();

    // Verify Hero Section copy is rendered
    expect(screen.getByText('Harmonize Your Devices,')).toBeInTheDocument();
    expect(screen.getByText('Amplify Your Sound.')).toBeInTheDocument();
    expect(screen.getByText('Download App')).toBeInTheDocument();
    expect(screen.getByText('Read Documentation')).toBeInTheDocument();

    // Verify Features Section copy is rendered
    expect(
      screen.getByText('Engineered for Synchronization'),
    ).toBeInTheDocument();
    expect(screen.getByText('Dual-Protocol Sync')).toBeInTheDocument();
    expect(screen.getByText('Seamless Fallback')).toBeInTheDocument();
    expect(screen.getByText('Dynamic Node Management')).toBeInTheDocument();
    expect(screen.getByText('Universal Compatibility')).toBeInTheDocument();
  });
});
