import { act } from '@testing-library/react';
import { useLocation } from 'react-router-dom';
import { renderWithRouter } from '@testUtils';
import { appStore } from '@appStore';
import NavigationBar from '../NavigationBar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn(),
}));

describe('NavigationBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useLocation as jest.Mock).mockReturnValue({ pathname: '/' });
    act(() => {
      appStore.getState().clearApiCredentials();
    });
  });

  it('should render standard navigation bar correctly', () => {
    const { container } = renderWithRouter(<NavigationBar />);
    expect(container).toMatchSnapshot();
  });

});
