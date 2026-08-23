import React, { useState } from 'react';
import { Category, SystemCategories } from '../types';
import { ArrowLeftIcon, LockIcon } from './Icons';
import PasscodeModal from './PasscodeModal';

interface CardEditorModalProps {
  categories: Category[];
  onSave: (data: { title: string; content: string; category: Category }) => void;
  onClose: () => void;
  initialData?: { title: string; content: string; category: Category };
  accentColor: string;
  passcode: string;
  onSetPasscode: (passcode: string) => void;
}

const CardEditorModal: React.FC<CardEditorModalProps> = ({ categories, onSave, onClose, initialData, accentColor, passcode, onSetPasscode }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState<Category>(initialData?.category || SystemCategories.DAILY);
  const [isPrivate, setIsPrivate] = useState(
    initialData?.category === SystemCategories.VAULT
  );
  const [showPasscodeGate, setShowPasscodeGate] = useState(false);
  const [newPasscodeDraft, setNewPasscodeDraft] = useState<string | null>(null);
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  const hasChanges = title.trim() !== (initialData?.title || '').trim() ||
    content.trim() !== (initialData?.content || '').trim() ||
    (isPrivate ? SystemCategories.VAULT : category) !== (initialData?.category || SystemCategories.DAILY);

  const handleClose = () => {
    if (hasChanges) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  const handleSaveAndClose = () => {
    if (title && content) {
      const finalCategory = isPrivate ? SystemCategories.VAULT : category;
      onSave({ title, content, category: finalCategory });
    }
  };

  const markAsPrivate = () => {
    setIsPrivate(true);
    setCategory(SystemCategories.VAULT);
  };

  const handlePrivateToggle = () => {
    if (!isPrivate) {
      if (passcode) {
        markAsPrivate();
      } else {
        setNewPasscodeDraft(null);
        setShowPasscodeGate(true);
      }
    } else {
      setIsPrivate(false);
      if (category === SystemCategories.VAULT) {
        setCategory(SystemCategories.DAILY);
      }
    }
  };

  const handleNewPasscode = (code: string) => {
    if (newPasscodeDraft === null) {
      setNewPasscodeDraft(code);
      return true;
    }

    if (code !== newPasscodeDraft) return false;

    onSetPasscode(code);
    markAsPrivate();
    setShowPasscodeGate(false);
    setNewPasscodeDraft(null);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && content) {
      const finalCategory = isPrivate ? SystemCategories.VAULT : category;
      onSave({ title, content, category: finalCategory });
    }
  };

  return (
    <div className="theme-page fixed inset-0 z-70 flex flex-col p-6 animate-in slide-in-from-bottom duration-300 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={handleClose} aria-label="Close card editor" className="editor-back-button p-3 bg-zinc-900 rounded-2xl active:scale-95 transition-transform outline-none border-none">
          <ArrowLeftIcon aria-hidden="true" />
        </button>
        <h2 className="text-2xl font-black">{initialData ? 'Edit Card' : 'New Card'}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto w-full">

        {/* Private Toggle */}
        <div
          onClick={handlePrivateToggle}
          className={`flex items-center justify-center gap-3 px-5 py-4 rounded-2xl border cursor-pointer transition-all ${
            isPrivate
              ? 'border-transparent'
              : 'bg-zinc-900 border-zinc-800'
          }`}
          style={isPrivate ? { backgroundColor: accentColor } : {}}
        >
          <div className={`shrink-0 ${isPrivate ? 'text-black' : 'text-zinc-400'}`}>
            <LockIcon />
          </div>
          <p className="font-black text-sm" style={{ color: isPrivate ? '#000000' : undefined }}>
            {isPrivate ? 'Card is Locked' : 'Lock This Card'}
          </p>
        </div>

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
                  className={`card-category-option py-4 rounded-2xl font-bold text-sm transition-all border truncate px-2 ${
                    category === cat ? 'is-selected' : 'bg-zinc-900 border-zinc-800'
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
          <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Card Name</label>
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
        <div>
          <label className="block text-zinc-500 text-xs font-black uppercase tracking-widest mb-2">Message to Show</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What should it say in huge letters?"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-white font-bold outline-none min-h-220px focus:ring-2 transition-all resize-none"
            style={{ '--tw-ring-color': accentColor } as any}
          />
        </div>

        <button
          type="submit"
          disabled={!title || !content || showPasscodeGate}
          className="w-full h-14 text-black rounded-2xl font-black text-base active:scale-95 transition-transform disabled:opacity-50 shadow-xl"
          style={{ backgroundColor: accentColor, boxShadow: `0 10px 30px ${accentColor}33` }}
        >
          SAVE CARD
        </button>
      </form>

      {showPasscodeGate && (
        <PasscodeModal
          key={newPasscodeDraft === null ? 'create-passcode' : 'confirm-passcode'}
          title={newPasscodeDraft === null ? 'Create PIN' : 'Confirm PIN'}
          accentColor={accentColor}
          onVerify={handleNewPasscode}
          onClose={() => {
            setShowPasscodeGate(false);
            setNewPasscodeDraft(null);
          }}
        />
      )}

      {showUnsavedPrompt && (
        <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/70 backdrop-blur-sm px-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 w-full max-w-sm space-y-4">
            <h3 className="font-black text-lg text-center">Save Before Leaving?</h3>
            <p className="text-zinc-400 text-sm text-center">You have unsaved changes. Save your card before leaving?</p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={handleSaveAndClose}
                disabled={!title || !content}
                className="w-full h-12 rounded-2xl font-black text-sm active:scale-95 transition-all disabled:opacity-40"
                style={{ backgroundColor: accentColor, color: 'black', border: 'none', borderWidth: 0 }}
              >
                SAVE CARD
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
                className="w-full h-12 font-black text-sm border-2 border-zinc-700 rounded-2xl active:scale-95 transition-all"
                style={{ color: '#000000', border: 'none' }}
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

export default CardEditorModal;