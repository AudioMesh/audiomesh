import { screen } from '@testing-library/react';
import Dashboard from '../Dashboard';
import { renderWithProvidersAndRouter } from '@testUtils';

describe('Dashboard', () => {

  it('should render Dashboard screen successfully', async () => {
    renderWithProvidersAndRouter(<Dashboard />);
    expect(await screen.findByText('AudioMesh Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Server Connection Settings')).toBeInTheDocument();
    expect(screen.getByText('Create New Mesh Room')).toBeInTheDocument();
    expect(screen.getByText('Active Server Rooms')).toBeInTheDocument();
    expect(screen.getByText('No Session Selected')).toBeInTheDocument();
  });
});
