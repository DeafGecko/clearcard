import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SettingsModal from '../../components/SettingsModal';
import type { UserPreferences } from '../../types';

const basePrefs: UserPreferences = {
  fontSize: 48,
  displaySize: 'normal',
  themeMode: 'light',
  vaultLocked: true,
  accentColor: '#FACC15',
  displayTextColor: '#FFFFFF',
  passcode: '123456',
  appLanguage: 'en',
} as UserPreferences;

describe('SettingsModal: live preview', () => {
  it('saves the display size as soon as it is tapped', () => {
    const onSave = vi.fn();
    render(<SettingsModal prefs={basePrefs} onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'enlarged' }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ displaySize: 'enlarged' }));
  });

  it('saves the theme as soon as it is tapped', () => {
    const onSave = vi.fn();
    render(<SettingsModal prefs={basePrefs} onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /dark/i }));
    expect(onSave).toHaveBeenCalledWith(expect.objectContaining({ themeMode: 'dark' }));
  });

  it('no longer offers a display text color option', () => {
    render(<SettingsModal prefs={basePrefs} onSave={() => {}} onClose={() => {}} />);
    expect(screen.queryByText('Display Text Color')).not.toBeInTheDocument();
  });
});

describe('SettingsModal: security', () => {
  it('asks for the current Secret Code before changing it', () => {
    render(<SettingsModal prefs={basePrefs} onSave={() => {}} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'CHANGE' }));
    expect(screen.getByPlaceholderText('Current 6 digits')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('New 6 digits')).not.toBeInTheDocument();
  });

  it('rejects a wrong current code and does not reach the new-code step', () => {
    render(<SettingsModal prefs={basePrefs} onSave={() => {}} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'CHANGE' }));
    fireEvent.change(screen.getByPlaceholderText('Current 6 digits'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Current code is incorrect.');
    expect(screen.getByPlaceholderText('Current 6 digits')).toBeInTheDocument();
  });

  it('moves to the new-code step after the correct current code', () => {
    render(<SettingsModal prefs={basePrefs} onSave={() => {}} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'CHANGE' }));
    fireEvent.change(screen.getByPlaceholderText('Current 6 digits'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(screen.getByPlaceholderText('New 6 digits')).toBeInTheDocument();
  });

  it('needs no current code when no Secret Code is set yet', () => {
    render(<SettingsModal prefs={{ ...basePrefs, passcode: '' }} onSave={() => {}} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'CHANGE' }));
    expect(screen.getByPlaceholderText('New 6 digits')).toBeInTheDocument();
  });
});
