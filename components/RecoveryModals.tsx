import React, { useState } from 'react';
import { verifyRecoveryKey, normalizeRecoveryKey } from '../lib/recovery';

interface RecoveryKeyModalProps {
  recoveryKey: string;
  accentColor: string;
  onDone: () => void;
}

// Shown once after a Secret Code is set. The key is never shown again.
export const RecoveryKeyModal: React.FC<RecoveryKeyModalProps> = ({ recoveryKey, accentColor, onDone }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(recoveryKey);
      setCopied(true);
    } catch {
      // Clipboard can be blocked; the key is still on screen to write down.
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div role="dialog" aria-modal="true" aria-labelledby="recovery-key-title" className="settings-unsaved-dialog bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm space-y-5">
        <h2 id="recovery-key-title" className="font-black text-lg text-center">Save your backup key</h2>
        <p className="text-sm text-center">
          Write this down. You need it if you forget your code. It shows one time only.
        </p>
        <p className="text-center font-black text-2xl tracking-widest break-all select-all" aria-label={`Backup key ${recoveryKey.split('-').join(' ')}`}>
          {recoveryKey}
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button onClick={copy} className="dialog-small-button px-6 rounded-xl font-black text-xs bg-zinc-800 active:scale-95 transition-all">
            {copied ? 'Copied' : 'Copy key'}
          </button>
          <button onClick={onDone} className="dialog-small-button px-6 rounded-xl font-black text-xs active:scale-95 transition-all" style={{ backgroundColor: accentColor, color: '#000000' }}>
            I saved it
          </button>
        </div>
      </div>
    </div>
  );
};

interface RecoveryEntryModalProps {
  storedHash: string;
  accentColor: string;
  onRecovered: (recoveryKey: string) => Promise<boolean>;
  onClose: () => void;
}

// Lets someone who forgot the Secret Code prove ownership with the recovery key.
export const RecoveryEntryModal: React.FC<RecoveryEntryModalProps> = ({ storedHash, accentColor, onRecovered, onClose }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const noKeyOnFile = !storedHash;
  const canSubmit = normalizeRecoveryKey(input).length === 16 && !checking;

  const submit = async () => {
    setChecking(true);
    const ok = await verifyRecoveryKey(input, storedHash);
    setChecking(false);
    if (!ok) {
      setError('That backup key does not match.');
      setInput('');
      return;
    }
    if (!(await onRecovered(normalizeRecoveryKey(input)))) {
      setError('This key cannot open the private area.');
      setInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div role="dialog" aria-modal="true" aria-labelledby="recovery-entry-title" className="settings-unsaved-dialog bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm space-y-5">
        <h2 id="recovery-entry-title" className="font-black text-lg text-center">Forgot your code?</h2>
        {noKeyOnFile ? (
          <p className="text-sm text-center">
            No backup key is saved for this code. Clearing browser data resets the app. That also deletes your cards.
          </p>
        ) : (
          <>
            <p className="text-sm text-center">Enter your 16-character backup key. Then set a new code in Settings.</p>
            <label className="block">
              <span className="sr-only">Backup key</span>
              <input
                type="text"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus
                value={input}
                onChange={e => { setInput(e.target.value); setError(''); }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full bg-black border border-zinc-800 rounded-xl h-12 px-4 text-center font-black text-lg tracking-widest uppercase focus:outline-none"
              />
            </label>
            {error && <p role="alert" className="text-xs font-bold text-red-500 text-center">{error}</p>}
          </>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {!noKeyOnFile && (
            <button onClick={submit} disabled={!canSubmit} className="dialog-small-button px-6 rounded-xl font-black text-xs disabled:opacity-30 active:scale-95 transition-all" style={{ backgroundColor: accentColor, color: '#000000' }}>
              Open Private
            </button>
          )}
          <button onClick={onClose} className="dialog-small-button px-6 rounded-xl font-black text-xs bg-zinc-800 active:scale-95 transition-all">
            Back
          </button>
        </div>
      </div>
    </div>
  );
};
