import React, { useState, useRef } from 'react';
import { X, Settings } from 'lucide-react';
import { DisplaySize, ThemeMode, UserPreferences } from '../types';
import { LockIcon, CirclePlusIcon, LightThemeIcon, DarkThemeIcon, HighContrastThemeIcon, CheckIcon, XIcon, ArrowRightIcon } from './Icons';
import { verifyPasscode } from '../lib/passcode';
import { clearPasscodeAttempts, getPasscodeLockSeconds, recordPasscodeFailure } from './PasscodeModal';

interface SettingsModalProps {
  prefs: UserPreferences;
  // change is passed only when the owner set a new Secret Code in this session.
  onSave: (newPrefs: UserPreferences, change?: { newCode: string; currentCode?: string }) => void;
  onClose: () => void;
}

const MODERN_COLORS = [
  { name: "Yellow", value: "#FACC15" },
  { name: "Cyan", value: "#22D3EE" },
  { name: "Rose", value: "#FB7185" },
  { name: "Lime", value: "#A3E635" },
  { name: "Violet", value: "#A78BFA" }
];



const SettingsModal: React.FC<SettingsModalProps> = ({ prefs, onSave, onClose }) => {
  const [accent, setAccent] = useState(prefs.accentColor);
  const [displaySize, setDisplaySize] = useState<DisplaySize>(prefs.displaySize || 'normal');
  const [themeMode, setThemeMode] = useState<ThemeMode>(prefs.themeMode || 'light');
  // null means the Secret Code is unchanged.
  const [newPasscode, setNewPasscode] = useState<string | null>(null);
  // The current code, kept after it was checked, so the Vault can be re-keyed on save.
  const [verifiedCode, setVerifiedCode] = useState<string | null>(null);
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  // Changing an existing code first needs the current one. A new code needs no check.
  const [passcodeVerified, setPasscodeVerified] = useState(false);
  const [passcodeError, setPasscodeError] = useState("");
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 540);
  };

  const hasChanges =
    accent !== prefs.accentColor ||
    displaySize !== (prefs.displaySize || 'normal') ||
    themeMode !== (prefs.themeMode || 'light') ||
    newPasscode !== null;

  const handleSave = () => {
    onSave(
      { ...prefs, accentColor: accent, displaySize, themeMode },
      newPasscode !== null ? { newCode: newPasscode, currentCode: verifiedCode ?? undefined } : undefined
    );
    triggerClose();
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedPrompt(true);
    } else {
      triggerClose();
    }
  };

  const startChangingPasscode = () => {
    setIsChangingPasscode(true);
    setPasscodeInput("");
    setPasscodeError("");
    setPasscodeVerified(!prefs.passcodeHash);
  };

  const cancelChangingPasscode = () => {
    setIsChangingPasscode(false);
    setPasscodeInput("");
    setPasscodeError("");
    setPasscodeVerified(false);
  };

  const handleVerifyCurrentPasscode = async () => {
    const lockSeconds = getPasscodeLockSeconds();
    if (lockSeconds > 0) {
      setPasscodeError(`Too many tries. Try again in ${lockSeconds} seconds.`);
      setPasscodeInput("");
      return;
    }
    if (await verifyPasscode(passcodeInput, prefs)) {
      clearPasscodeAttempts();
      setVerifiedCode(passcodeInput);
      setPasscodeVerified(true);
      setPasscodeError("");
    } else {
      recordPasscodeFailure();
      setPasscodeError("Current code is incorrect.");
    }
    setPasscodeInput("");
  };

  const handleUpdatePasscode = () => {
    if (passcodeInput.length === 6 && passcodeVerified) {
      setNewPasscode(passcodeInput);
      cancelChangingPasscode();
    }
  };

  const isCustomColor = !MODERN_COLORS.some(c => c.value === accent);
  return (
    <div className={`settings-overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-110 flex justify-end overflow-hidden${isClosing ? ' is-closing' : ''}`} onClick={handleClose}>
      <div className={`settings-panel bg-zinc-900 w-full max-w-105 h-full border-l border-zinc-800 shadow-2xl flex flex-col p-6 overflow-y-auto no-scrollbar${isClosing ? ' is-closing' : ''}`} role="dialog" aria-modal="true" onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-8">
          <h2 className="flex items-center gap-3 text-xl font-black"><Settings size={24} strokeWidth={2.5} aria-hidden="true" />Settings</h2>
          <button onClick={handleClose} aria-label="Close Settings" className="settings-close flex items-center justify-center active:scale-90 transition-transform text-zinc-400">
            <X size={22} strokeWidth={2.5} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-8">

          {/* Appearance */}
          <section>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Look</label>
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Color theme">
              {([
                { value: 'light', label: 'Light', icon: LightThemeIcon },
                { value: 'dark', label: 'Dark', icon: DarkThemeIcon },
                { value: 'highContrast', label: 'Strong colors', icon: HighContrastThemeIcon },
              ] as const).map(option => {
                const Icon = option.icon;
                const isSelected = themeMode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setThemeMode(option.value);
                      onSave({ ...prefs, themeMode: option.value });
                    }}
                    aria-pressed={isSelected}
                    className={`theme-mode-option ${isSelected ? 'is-selected' : ''}`}
                    style={isSelected ? { backgroundColor: accent, color: '#000000' } : undefined}
                  >
                    <Icon size={24} />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Accent Color */}
          <section>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Theme</label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {MODERN_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setAccent(color.value)}
                  aria-label={`Accent color ${color.name}`}
                  aria-pressed={accent === color.value}
                  className={`accent-swatch rounded-full transition-all duration-200 flex items-center justify-center ${accent === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : "opacity-50 hover:opacity-100 scale-90"}`}
                  style={{ backgroundColor: color.value }}
                >
                  {accent === color.value && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                </button>
              ))}
              <div className="relative">
                <label htmlFor="custom-color-picker" className="sr-only">Pick custom accent color</label>
                <input
                  id="custom-color-picker"
                  type="color"
                  ref={colorInputRef}
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  aria-label="Pick custom accent color"
                  onChange={(e) => setAccent(e.target.value)}
                />
                <button
                  onClick={() => colorInputRef.current?.click()}
                  aria-label="Open custom color picker"
                  className={`accent-swatch rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center transition-all ${isCustomColor ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 border-solid" : "opacity-50 hover:opacity-100"}`}
                  style={isCustomColor ? { backgroundColor: accent } : {}}
                >
                  <div className={isCustomColor ? "text-black scale-75" : "text-zinc-500 scale-75"}><CirclePlusIcon /></div>
                </button>
              </div>
            </div>
          </section>

          {/* Display Size */}
          <section>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Text size</label>
            <div className="flex gap-2" role="group" aria-label="Display size">
              {(['compact', 'normal', 'enlarged'] as DisplaySize[]).map(size => (
                <button
                  key={size}
                  onClick={() => {
                    setDisplaySize(size);
                    onSave({ ...prefs, displaySize: size });
                  }}
                  aria-pressed={displaySize === size}
                  className={`display-size-option flex-1 rounded-xl font-bold capitalize transition-all ${displaySize === size ? 'is-selected' : ''}`}
                  style={displaySize === size ? { backgroundColor: accent, color: '#000000' } : undefined}
                >
                  {size === 'enlarged' ? 'Biggest' : size}
                </button>
              ))}
            </div>
          </section>

          {/* Passcode */}
          <section>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Code</label>
            <div className="passcode-row">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-zinc-500"><LockIcon /></div>
                  <h3 className="font-bold">Code</h3>
                </div>
                {!isChangingPasscode && (
                  <button onClick={startChangingPasscode} className="font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none" style={{ color: '#000000', backgroundColor: accent, border: 'none', borderWidth: 0 }}>Change code</button>
                )}
              </div>
              {isChangingPasscode ? (
                <div className="space-y-3">
                  {!passcodeVerified && (
                    <p className="text-xs font-bold text-zinc-500">Enter your current code first.</p>
                  )}
                  <label className="block">
                    <span className="sr-only">{passcodeVerified ? "New code" : "Current code"}</span>
                    <input type="password" inputMode="numeric" maxLength={6} autoFocus value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, ""))} placeholder={passcodeVerified ? "New code, 6 digits" : "Current code"} className="settings-code-input w-full bg-black border border-zinc-800 rounded-xl h-10 px-4 text-center font-black text-lg tracking-[0.5em] focus:outline-none" />
                  </label>
                  {passcodeError && (
                    <p role="alert" className="text-xs font-bold text-red-500">{passcodeError}</p>
                  )}
                  <div className="flex gap-2">
                    <button onClick={cancelChangingPasscode} className="flex-1 h-9 bg-zinc-900 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2"><XIcon size={14} />Cancel</button>
                    {passcodeVerified ? (
                      <button onClick={handleUpdatePasscode} disabled={passcodeInput.length !== 6} className="flex-1 h-9 rounded-lg font-black text-[10px] uppercase tracking-widest disabled:opacity-30" style={{ backgroundColor: accent, color: "black" }}>Set</button>
                    ) : (
                      <button onClick={handleVerifyCurrentPasscode} disabled={passcodeInput.length !== 6} className="flex-1 h-9 rounded-lg font-black text-[10px] uppercase tracking-widest disabled:opacity-30" style={{ backgroundColor: accent, color: "black" }}><span className="flex items-center justify-center gap-2">Continue<ArrowRightIcon size={14} /></span></button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex gap-1.5 px-1 py-1">
                  {[...Array(6)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-800" />)}
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="mt-10">
          <button onClick={handleSave} className="w-full h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all" style={{ backgroundColor: accent, color: "black", border: 'none', outline: 'none' }}>
            <CheckIcon size={20} />
            SAVE CHANGES
          </button>
        </div>
      </div>

      {showUnsavedPrompt && (
        <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6" onClick={e => e.stopPropagation()}>
          <div className="settings-unsaved-dialog bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm space-y-5" data-theme={themeMode}>
            <h3 className="font-black text-lg text-center">Save Before Leaving?</h3>
            <p className="settings-unsaved-copy text-sm text-center">Save before you leave?</p>
            <div className="flex flex-col gap-3 pt-4">
              <button
                onClick={handleSave}
                className="w-full h-12 rounded-2xl font-black text-sm active:scale-95 transition-all"
                style={{ backgroundColor: accent, color: "black", border: 'none', borderWidth: 0, outline: 'none' }}
              >
                SAVE CHANGES
              </button>
              <button
                onClick={onClose}
                className="w-full h-12 rounded-2xl font-black text-sm active:scale-95 transition-all"
                style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none' }}
              >
                CANCEL
              </button>
              <button
                onClick={() => setShowUnsavedPrompt(false)}
                className="settings-unsaved-continue w-full h-12 font-black text-sm rounded-2xl active:scale-95 transition-all"
              >
                Continue Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;
