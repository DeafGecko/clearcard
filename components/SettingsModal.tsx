import React, { useState, useRef } from 'react';
import { UserPreferences } from '../types';
import { ArrowLeftIcon, LockIcon, CirclePlusIcon } from './Icons';

interface SettingsModalProps {
  prefs: UserPreferences;
  onSave: (newPrefs: UserPreferences) => void;
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
  const [displayTextCol, setDisplayTextCol] = useState(prefs.displayTextColor || "#FFFFFF");
  const [newPasscode, setNewPasscode] = useState(prefs.passcode);
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const colorInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    onSave({ ...prefs, accentColor: accent, displayTextColor: displayTextCol, passcode: newPasscode });
    onClose();
  };

  const handleUpdatePasscode = () => {
    if (passcodeInput.length === 6) {
      setNewPasscode(passcodeInput);
      setIsChangingPasscode(false);
      setPasscodeInput("");
    }
  };

  const isCustomColor = !MODERN_COLORS.some(c => c.value === accent);
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-110 flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-zinc-900 w-full max-w-[320px] rounded-4x1 border border-zinc-800 shadow-2xl flex flex-col p-6 animate-in zoom-in-95 fade-in duration-200 overflow-y-auto max-h-[90vh] no-scrollbar" role="dialog" aria-modal="true">

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black">Settings</h2>
          <button onClick={onClose} aria-label="Close Settings" className="p-2 bg-zinc-800 rounded-xl active:scale-90 transition-transform text-zinc-400">
            <ArrowLeftIcon aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-8">

          {/* Accent Color */}
          <section>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Accent Theme</label>
            <div className="flex flex-wrap gap-2.5 items-center">
              {MODERN_COLORS.map((color) => (
                <button
                  key={color.value}Button
                  onClick={() => setAccent(color.value)}
                  className={`w-8 h-8 rounded-full transition-all duration-200 flex items-center justify-center ${accent === color.value ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900" : "opacity-50 hover:opacity-100 scale-90"}`}
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
                  className={`w-8 h-8 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center transition-all ${isCustomColor ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 border-solid" : "opacity-50 hover:opacity-100"}`}
                  style={isCustomColor ? { backgroundColor: accent } : {}}
                >
                  <div className={isCustomColor ? "text-black scale-75" : "text-zinc-500 scale-75"}><CirclePlusIcon /></div>
                </button>
              </div>
            </div>
          </section>

          {/* Display Text Color */}
          <section>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-4">Display Text Color</label>
            <div className="flex gap-3">
              <button onClick={() => setDisplayTextCol("#FFFFFF")} className={`flex-1 h-10 rounded-xl font-bold text-xs border transition-all ${displayTextCol === "#FFFFFF" ? "bg-white text-black border-white" : "bg-zinc-800 text-white border-zinc-700"}`}>White</button>
              <button onClick={() => setDisplayTextCol("#FFFF00")} className={`flex-1 h-10 rounded-xl font-bold text-xs border transition-all ${displayTextCol === "#FFFF00" ? "bg-yellow-400 text-black border-yellow-400" : "bg-zinc-800 text-yellow-400 border-zinc-700"}`}>Yellow</button>
            </div>
          </section>

          {/* Passcode */}
          <section>
            <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-3">Security</label>
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-zinc-900 rounded-lg text-zinc-500 scale-75"><LockIcon /></div>
                  <h3 className="font-bold text-sm">Passcode</h3>
                </div>
                {!isChangingPasscode && (
                  <button onClick={() => setIsChangingPasscode(true)} className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-zinc-900 rounded-lg" style={{ color: accent }}>Change</button>
                )}
              </div>
              {isChangingPasscode ? (
                <div className="space-y-3">
                  <input type="password" inputMode="numeric" maxLength={6} autoFocus value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value.replace(/\D/g, ""))} placeholder="6 digits" className="w-full bg-black border border-zinc-800 rounded-xl h-10 px-4 text-center font-black text-lg tracking-[0.5em] focus:outline-none" />
                  <div className="flex gap-2">
                    <button onClick={() => { setIsChangingPasscode(false); setPasscodeInput(""); }} className="flex-1 h-9 bg-zinc-900 rounded-lg font-bold text-[10px]">Cancel</button>
                    <button onClick={handleUpdatePasscode} disabled={passcodeInput.length !== 6} className="flex-1 h-9 rounded-lg font-black text-[10px] uppercase tracking-widest disabled:opacity-30" style={{ backgroundColor: accent, color: "black" }}>Set</button>
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
          <button onClick={handleSave} className="w-full h-14 rounded-2xl font-black text-sm active:scale-95 transition-all" style={{ backgroundColor: accent, color: "black" }}>
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
