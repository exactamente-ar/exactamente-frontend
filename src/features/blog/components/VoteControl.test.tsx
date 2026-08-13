import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoteControl from './VoteControl';

describe('VoteControl', () => {
  it('muestra los botones deshabilitados cuando no se puede votar', () => {
    render(<VoteControl netScore={3} myVote={0} canVote={false} onVote={() => {}} />);
    expect(screen.getByRole('button', { name: 'Votar a favor' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Votar en contra' })).toBeDisabled();
  });

  it('habilita los botones y llama onVote al clickear', async () => {
    const onVote = vi.fn();
    const user = userEvent.setup();
    render(<VoteControl netScore={3} myVote={0} canVote onVote={onVote} />);

    const up = screen.getByRole('button', { name: 'Votar a favor' });
    expect(up).not.toBeDisabled();
    await user.click(up);
    expect(onVote).toHaveBeenCalledWith(1);
  });

  it('marca el voto activo en dorado', () => {
    render(<VoteControl netScore={3} myVote={1} canVote onVote={() => {}} />);
    expect(screen.getByRole('button', { name: 'Votar a favor' })).toHaveClass('text-yellow-300');
  });
});
