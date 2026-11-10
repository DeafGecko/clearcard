import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickWriteModal from '../../components/QuickWriteModal';

const renderModal = () => {
  const onShow = vi.fn();
  const onSaveAsCard = vi.fn();
  const onClose = vi.fn();
  render(<QuickWriteModal accentColor="#FACC15" onShow={onShow} onSaveAsCard={onSaveAsCard} onClose={onClose} />);
  return { onShow, onSaveAsCard, onClose };
};

describe('QuickWriteModal', () => {
  it('keeps both actions disabled until something is typed', () => {
    renderModal();
    expect(screen.getByRole('button', { name: 'Show now' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Save as card' })).toBeDisabled();
  });

  it('treats spaces only as empty', () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Show now' })).toBeDisabled();
  });

  it('shows the trimmed message', () => {
    const { onShow } = renderModal();
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: '  Table for two  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Show now' }));
    expect(onShow).toHaveBeenCalledWith('Table for two');
  });

  it('passes the message on when saving as a card', () => {
    const { onSaveAsCard } = renderModal();
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Coffee, please' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save as card' }));
    expect(onSaveAsCard).toHaveBeenCalledWith('Coffee, please');
  });
});
