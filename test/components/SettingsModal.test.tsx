import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SettingsModal from '../../components/SettingsModal';
import type { UserPreferences } from '../../types';
import { createPasscodeRecord } from '../../lib/passcode';

const basePrefs: UserPreferences = {
  fontSize: 48,
  displaySize: 'normal',
  themeMode: 'light',
  vaultLocked: true,
  accentColor: '#FACC15',
  displayTextColor: '#FFFFFF',
  ...(await createPasscodeRecord('123456')),
  appLanguage: 'en',
} as UserPreferences;

describe('SettingsModal: live preview', () => {
  it('saves the display size as soon as it is tapped', () => {
    const onSave = vi.fn();
    render(<SettingsModal prefs={basePrefs} onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Biggest' }));
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
    fireEvent.click(screen.getByRole('button', { name: 'Change code' }));
    expect(screen.getByPlaceholderText('Enter current code')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('New code, 6 digits')).not.toBeInTheDocument();
  });

  it('rejects a wrong current code and does not reach the new-code step', async () => {
    render(<SettingsModal prefs={basePrefs} onSave={() => {}} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change code' }));
    fireEvent.change(screen.getByPlaceholderText('Enter current code'), { target: { value: '000000' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Current code is incorrect.'));
    expect(screen.getByPlaceholderText('Enter current code')).toBeInTheDocument();
  });

  it('moves to the new-code step after the correct current code', async () => {
    render(<SettingsModal prefs={basePrefs} onSave={() => {}} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change code' }));
    fireEvent.change(screen.getByPlaceholderText('Enter current code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByPlaceholderText('New code, 6 digits')).toBeInTheDocument();
  });

  it('says Create code when no Secret Code is set yet, and needs no current code', () => {
    render(<SettingsModal prefs={{ ...basePrefs, passcodeHash: undefined, passcodeSalt: undefined }} onSave={() => {}} onClose={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Create code' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Code' }));
    fireEvent.click(screen.getByRole('button', { name: 'Create code' }));
    expect(screen.getByPlaceholderText('New code, 6 digits')).toBeInTheDocument();
  });

  it('turning the code off asks for the current code and saves the turn-off', async () => {
    const onSave = vi.fn();
    render(<SettingsModal prefs={basePrefs} onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Code' }));
    fireEvent.change(screen.getByPlaceholderText('Enter current code'), { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(screen.queryByPlaceholderText('Enter current code')).not.toBeInTheDocument());
    expect(screen.getByRole('switch', { name: 'Code' })).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'SAVE CHANGES' }));
    expect(onSave).toHaveBeenCalledWith(expect.anything(), { turnOff: true, currentCode: '123456' });
  });

  it('turning the code off needs no code when Private is already open', () => {
    const onSave = vi.fn();
    render(<SettingsModal prefs={basePrefs} vaultOpen onSave={onSave} onClose={() => {}} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Code' }));
    expect(screen.queryByPlaceholderText('Enter current code')).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Code' })).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'SAVE CHANGES' }));
    expect(onSave).toHaveBeenCalledWith(expect.anything(), { turnOff: true, currentCode: undefined });
  });
});
