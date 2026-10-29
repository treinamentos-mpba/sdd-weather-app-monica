import { render, screen } from '@testing-library/react';
import LoadingState from '../../src/components/states/LoadingState';

describe('LoadingState', () => {
  it('announces the default loading message through a status role', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando dados meteorológicos...');
  });

  it('renders a provided loading message', () => {
    render(<LoadingState message="Buscando cidade..." />);

    expect(screen.getByRole('status')).toHaveTextContent('Buscando cidade...');
  });
});
