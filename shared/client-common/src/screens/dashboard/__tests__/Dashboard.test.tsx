import { screen, act } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { renderWithProvidersAndRouter } from '@testUtils';
import { appStore } from '@appStore';

describe('Dashboard', () => {
  beforeEach(() => {
    act(() => {
      appStore.setState({
        currentAccount: { phone: 'iPhone 15', apiId: '123456', apiHash: 'mock_hash' },
      });
    });
  });

  it('should render Dashboard screen successfully', async () => {
    renderWithProvidersAndRouter(<Dashboard />);
    expect(await screen.findByText('AudioMesh Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Audio Playback')).toBeInTheDocument();
    expect(screen.getByText('Connected Speaker Nodes')).toBeInTheDocument();
    expect(screen.getByText('Host (This Device)')).toBeInTheDocument();
    expect(screen.getByText('iPhone 15')).toBeInTheDocument();
    expect(screen.getByText('iPad Pro')).toBeInTheDocument();
  });
});
