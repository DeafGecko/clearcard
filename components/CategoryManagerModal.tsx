
import React, { useState } from 'react';
import { Category, SystemCategories } from '../types';
import { ArrowLeftIcon, PlusIcon, UpIcon, DownIcon, CircleXIcon } from './Icons';

interface CategoryManagerModalProps {
  categories: Category[];
  onAdd: (name: string) => void;
  onDelete: (name: string) => void;
  onReorder: (newOrder: Category[]) => void;
  onClose: () => void;
  accentColor: string;
}

const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({ categories, onAdd, onDelete, onReorder, onClose, accentColor }) => {
  const [newCat, setNewCat] = useState('');
  const [error, setError] = useState<string | null>(null);

  const triggerHaptic = (ms: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCat.trim();
    if (!trimmed) return;

    if (categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setError('Category already exists');
      setTimeout(() => setError(null), 2000);
      return;
    }

    onAdd(trimmed);
    setNewCat('');
    setError(null);
  };

  const isProtected = (cat: string) => 
    cat === SystemCategories.VAULT || cat === SystemCategories.EMERGENCY;

  const canDelete = (cat: string) => {
    if (isProtected(cat)) return false;
    const nonProtectedCats = categories.filter(c => !isProtected(c));
    return nonProtectedCats.length > 1;
  };

  const moveCategory = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return;
    
    triggerHaptic(15);
    const newOrder = [...categories];
    const [movedItem] = newOrder.splice(index, 1);
    newOrder.splice(newIndex, 0, movedItem);
    onReorder(newOrder);
  };

  return (
    <div className="fixed inset-0 bg-black z-80 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onClose} 
          className="p-3 bg-zinc-900 rounded-2xl active:scale-90 transition-transform"
          aria-label="Back"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="text-2xl font-black">Modify Categories</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-8">
        <div className="flex gap-2">
          <input 
            autoFocus
            value={newCat}
            onChange={(e) => { setNewCat(e.target.value); setError(null); }}
            placeholder="New Category..."
            className={`flex-1 h-14 bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-800'} rounded-2xl px-6 text-white font-bold outline-none transition-colors`}
          />
          <button 
            type="submit"
            aria-label="Add new category"
            disabled={!newCat.trim()}
            className="h-14 px-6 text-black rounded-2xl font-black disabled:opacity-30 active:scale-95 transition-transform"
            style={{ backgroundColor: accentColor }}
          >
            <PlusIcon aria-hidden="true" />
          </button>
        </div>
        {error && <p className="text-red-500 text-xs font-bold px-2 animate-pulse">{error}</p>}
      </form>

      <div className="flex-1 overflow-y-auto space-y-3 pb-32">
        <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest px-2 mb-1">
          Sort & Manage ({categories.length})
        </label>
        {categories.map((cat, index) => (
          <div 
            key={cat} 
            className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-2xl group active:bg-zinc-900 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <button 
                  onClick={() => moveCategory(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-zinc-600 disabled:opacity-0 active:scale-125 transition-all"
                  aria-label="Move Up"
                  style={{ color: index !== 0 ? accentColor : undefined }}
                >
                  <UpIcon />
                </button>
                <button 
                  onClick={() => moveCategory(index, 'down')}
                  disabled={index === categories.length - 1}
                  className="p-1 text-zinc-600 disabled:opacity-0 active:scale-125 transition-all"
                  aria-label="Move Down"
                  style={{ color: index !== categories.length - 1 ? accentColor : undefined }}
                >
                  <DownIcon />
                </button>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight">{cat}</span>
                {isProtected(cat) && (
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">System Essential</span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canDelete(cat) ? (
                <button 
                  onClick={() => onDelete(cat)}
                  className="text-red-500 p-2 active:scale-90 bg-red-500/10 rounded-xl transition-all border border-red-500/20"
                  aria-label={`Delete ${cat}`}
                >
                  <CircleXIcon />
                </button>
              ) : (
                <div className="bg-zinc-900 p-3 rounded-xl opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagerModal;
