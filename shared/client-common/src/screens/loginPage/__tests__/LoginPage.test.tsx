import { screen } from '@testing-library/react';
import LoginPage from '../LoginPage';
import { renderWithRouter } from '@testUtils';
import { appStore } from '@appStore';
import { act } from '@testing-library/react';

describe('LoginPage', () => {
  beforeEach(() => {
    act(() => {
      appStore.setState({
        savedAccounts: [],
        currentAccount: null,
      });
    });
  });

  it('should render simplified login page', () => {
    renderWithRouter(<LoginPage />);
    expect(screen.getByPlaceholderText('Enter node name (e.g., iPhone 15, MacBook Pro)')).toBeInTheDocument();
  });
});
