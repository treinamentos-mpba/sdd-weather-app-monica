import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorState from '../../src/components/states/ErrorState';

describe('ErrorState', () => {
  it('announces the error message and calls retry when requested', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState message="Verifique sua conexão." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Verifique sua conexão.');
    await user.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
