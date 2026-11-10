import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PasscodeModal from '../../components/PasscodeModal';

const typeCode = (code: string) => {
  for (const digit of code) fireEvent.click(screen.getByRole('button', { name: digit }));
};

describe('PasscodeModal', () => {
  it('shows the keypad with digits 0-9 and a delete key', () => {
    render(<PasscodeModal onVerify={() => false} onClose={() => {}} accentColor="#FACC15" />);
    for (const digit of '0123456789') {
      expect(screen.getByRole('button', { name: digit })).toBeInTheDocument();
    }
    expect(screen.getByRole('button', { name: 'Delete last digit' })).toBeInTheDocument();
  });

  it('sends the full six-digit code to onVerify', async () => {
    const onVerify = vi.fn(() => true);
    render(<PasscodeModal onVerify={onVerify} onClose={() => {}} accentColor="#FACC15" />);
    typeCode('123456');
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('123456'));
  });

  it('shows "Wrong Code" after an incorrect six-digit entry', async () => {
    render(<PasscodeModal onVerify={() => false} onClose={() => {}} accentColor="#FACC15" />);
    typeCode('000000');
    expect(await screen.findByText('Wrong Code')).toBeInTheDocument();
  });

  it('ignores digits beyond six', async () => {
    const onVerify = vi.fn(() => false);
    render(<PasscodeModal onVerify={onVerify} onClose={() => {}} accentColor="#FACC15" />);
    typeCode('12345678');
    await waitFor(() => expect(onVerify).toHaveBeenCalledWith('123456'));
    expect(onVerify).toHaveBeenCalledTimes(1);
  });

  it('calls onClose from the back button', () => {
    const onClose = vi.fn();
    render(<PasscodeModal onVerify={() => false} onClose={onClose} accentColor="#FACC15" />);
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it('locks out after five wrong codes and keeps the lock after reload', async () => {
    const { unmount } = render(<PasscodeModal onVerify={() => false} onClose={() => {}} accentColor="#FACC15" />);
    for (let i = 0; i < 4; i++) {
      typeCode('000000');
      await screen.findByText('Wrong Code');
    }
    typeCode('000000');
    expect(await screen.findByText('Too many tries')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled();

    unmount();
    render(<PasscodeModal onVerify={() => false} onClose={() => {}} accentColor="#FACC15" />);
    expect(screen.getByText('Too many tries')).toBeInTheDocument();
  });

  it('does not accept the correct code while locked out', async () => {
    localStorage.setItem('visio_passcode_attempts', JSON.stringify({ failures: 0, lockedUntil: Date.now() + 60_000 }));
    const onVerify = vi.fn(() => true);
    render(<PasscodeModal onVerify={onVerify} onClose={() => {}} accentColor="#FACC15" />);
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    expect(screen.getByRole('button', { name: '1' })).toBeDisabled();
    expect(onVerify).not.toHaveBeenCalled();
  });

  it('clears the failure count after a correct code', async () => {
    let correct = false;
    render(<PasscodeModal onVerify={() => correct} onClose={() => {}} accentColor="#FACC15" />);
    typeCode('000000');
    await screen.findByText('Wrong Code');
    correct = true;
    typeCode('123456');
    await waitFor(() => expect(JSON.parse(localStorage.getItem('visio_passcode_attempts') ?? '{}').failures ?? 0).toBe(0));
  });

  it('shows a Forgot code option only when a handler is given', () => {
    const { unmount } = render(<PasscodeModal onVerify={() => false} onClose={() => {}} accentColor="#FACC15" />);
    expect(screen.queryByRole('button', { name: 'Forgot code?' })).not.toBeInTheDocument();
    unmount();
    const onForgot = vi.fn();
    render(<PasscodeModal onVerify={() => false} onClose={() => {}} accentColor="#FACC15" onForgot={onForgot} />);
    fireEvent.click(screen.getByRole('button', { name: 'Forgot code?' }));
    expect(onForgot).toHaveBeenCalled();
  });
});
