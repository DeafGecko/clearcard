import React, { useState } from 'react';
import { Category, SystemCategories } from '../types';
import { ArrowLeftIcon, SparklesIcon, LockIcon } from './Icons';
import { rewriteMessage } from '../services/geminiService';

interface CardEditorModalProps {
  categories: Category[];
  onSave: (data: { title: string; content: string; category: Category }) => void;
  onClose: () => void;
  initialData?: { title: string; content: string; category: Category };
  accentColor: string;
  passcode: string;
}

const CardEditorModal: React.FC<CardEditorModalProps> = ({ categories, onSave, onClose, initialData, accentColor, passcode }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState<Category>(initialData?.category || SystemCategories.DAILY);
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isPrivate, setIsPrivate] = useState(
    initialData?.category === SystemCategories.VAULT
  );
  const [showPasscodeGate, setShowPasscodeGate] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [passcodeError, setPasscodeError] = useState(false);

  const handlePrivateToggle = () => {
    if (!isPrivate) {
      // Turning on private — ask for passcode
      setShowPasscodeGate(true);
    } else {
      // Turning off private
      setIsPrivate(false);
      if (category === SystemCategories.VAULT) {
        setCategory(SystemCategories.DAILY);
      }
    }
  };

  const handlePasscodeSubmit = () => {
    if (passcodeInput === passcode) {
      setIsPrivate(true);
      setCategory(SystemCategories.VAULT);
      setShowPasscodeGate(false);
      setPasscodeInput('');
      setPasscodeError(false);
    } else {
      setPasscodeError(true);
      setPasscodeInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content && !isRewriting) {
      const finalCategory = isPrivate ? SystemCategories.VAULT : category;
      onSave({ title, content, category: finalCategory });
    }
  };

  const handleRewrite = async (tone: 'professional' | 'casual') => {
    if (!content.trim() || isRewriting) return;
    setIsRewriting(true);
    setIsAiMenuOpen(false);
    try {
      const improved = await rewriteMessage(content, tone);
      setContent(improved);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRewriting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[70] flex flex-col p-6 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onClose} className="p-3 bg-zinc-900 rounded-2xl active:scale-95 transition-transform">
          <ArrowLeftIcon />
        </button>
        <h2 className="text-2xl font-black">{initialData ? 'Edit Card' : 'New Card'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto w-full">

        {/* Private Toggle */}
        <div
          onClick={handlePrivateToggle}
          className={`flex items-center justify-between px-5 py-4 rounded-2xl border cursor-pointer transition-all ${
            isPrivate
              ? 'border-transparent'
              : 'bg-zinc-900 border-zinc-800'
          }`}
          style={isPrivate ? { backgroundColor: accentColor } : {}}
        >
          <div className="flex items-center gap-3">
            <div className={isPrivate ? 'text-black' : 'text-zinc-500'}>
              <LockIcon />
            </div>
            <div>
              <p className={`font-black text-sm ${isPrivate ? 'text-black' : 'text-white'}`}>Private Information</p>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${isPrivate ? 'text-black/60' : 'text-zinc-600'}`}>
                {isPrivate ? 'Requires passcode to view' : 'Tap to mark as private'}
              </p>
            </div>
          </div>
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isPrivate ? 'border-black bg-black' : 'border-zinc-700'
          }`}>
            {isPrivate && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: accentColor }} />}
          </div>
        </div>

        {/* Passcode Gate */}
        {showPasscodeGate && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4 animate-in fade-in zoom-in duration-200">
            <p className="text-sm font-black text-center">Enter passcode to mark as private</p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              value={passcodeInput}
              onChange={(e) => { setPasscodeInput(e.target.value.replace(/\D/g, '')); setPasscodeError(false); }}
              placeholder="6 digits"
              className={`w-full bg-black border rounded-xl h-12 px-4 text-center font-black text-lg tracking-[0.5em] focus:outline-none ${
                passcodeError ? 'border-red-500' : 'border-zinc-700'
              }`}
            />
            {passcodeError && <p className="text-red-500 text-xs font-bold text-center">Incorrect passcode</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setShowPasscodeGate(false); setPasscodeInput(''); setPasscodeError(false); }}
                className="flex-1 h-10 bg-zinc-800 rounded-xl font-bold text-xs"
              >Cancel</button>
              <button
                type="button"
                onClick={handlePasscodeSubmit}
                disabled={passcodeInput.length !== 6}
                className="flex-1 h-10 rounded-xl font-black text-xs text-black disabled:opacity-30"
                style={{ backgroundColor: accentColor }}
              >Confirm</button>
            </div>
          </div>
        )}

        {/* Category — hidden if private */}
        {!isPrivate && (
          <div>
            <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.filter(c => c !== SystemCategories.VAULT).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-4 rounded-2xl font-bold text-sm transition-all border truncate px-2 ${
                    category === cat ? 'text-black' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                  }`}
                  style={category === cat ? { backgroundColor: accentColor, borderColor: accentColor } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Card Title</label>
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Starbucks Order"
            className="w-full h-16 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 text-white font-bold outline-none focus:ring-2 transition-all"
            style={{ '--tw-ring-color': accentColor } as any}
          />
        </div>

        {/* Content */}
        <div className="relative">
          <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Display Message</label>
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What should it say in huge letters?"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 pb-16 text-white font-bold outline-none min-h-[220px] focus:ring-2 transition-all resize-none"
              style={{ '--tw-ring-color': accentColor } as any}
            />

            {/* Smart Assist Button */}
            <div className="absolute bottom-4 right-4 flex items-center">
              {isAiMenuOpen && (
                <div className="absolute bottom-full right-0 mb-3 bg-zinc-800 border border-zinc-700 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[140px] animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <button type="button" onClick={() => handleRewrite('professional')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-700 text-sm font-bold transition-colors flex items-center justify-between">
                    Professional
                    <span className="text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">FORMAL</span>
                  </button>
                  <button type="button" onClick={() => handleRewrite('casual')} className="w-full text-left px-4 py-3 rounded-xl hover:bg-zinc-700 text-sm font-bold transition-colors flex items-center justify-between">
                    Casual
                    <span className="text-[8px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-500">FRIENDLY</span>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
                disabled={isRewriting || !content.trim()}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-90 disabled:opacity-30 disabled:grayscale ${
                  isAiMenuOpen ? 'bg-white text-black' : 'bg-zinc-800 text-white'
                }`}
                style={!isAiMenuOpen ? { color: accentColor } : {}}
                title="Smart Rewrite"
              >
                {isRewriting ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SparklesIcon />
                )}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 font-bold uppercase tracking-wider px-2 italic">
            Tip: Use Smart Rewrite to refine your message tone.
          </p>
        </div>

        <button
          type="submit"
          disabled={!title || !content || isRewriting || showPasscodeGate}
          className="w-full h-14 text-black rounded-2xl font-black text-base active:scale-95 transition-transform disabled:opacity-50 shadow-xl"
          style={{ backgroundColor: accentColor, boxShadow: `0 10px 30px ${accentColor}33` }}
        >
          {isRewriting ? 'REWRITING...' : 'SAVE CARD'}
        </button>
      </form>
    </div>
  );
};

export default CardEditorModal;