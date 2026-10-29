import { render, screen } from '@testing-library/react';
import EmptyState from '../../src/components/states/EmptyState';

describe('EmptyState', () => {
  it('renders the provided title and tip in an announced status', () => {
    render(
      <EmptyState title="Nenhuma cidade encontrada" tip="Confira a grafia e tente novamente." />,
    );

    const status = screen.getByRole('status');

    expect(status).toHaveTextContent('Nenhuma cidade encontrada');
    expect(status).toHaveTextContent('Confira a grafia e tente novamente.');
  });
});
