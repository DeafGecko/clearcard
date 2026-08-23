
import React, { useState, useRef } from 'react';
import { Category, SystemCategories } from '../types';
import { ArrowLeftIcon, PlusIcon, TrashIcon } from './Icons';

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
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const triggerHaptic = (ms: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
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


  const moveUp = (index: number) => {
    if (index === 0) return;
    triggerHaptic(15);
    const newOrder = [...categories];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    onReorder(newOrder);
  };

  const moveDown = (index: number) => {
    if (index === categories.length - 1) return;
    triggerHaptic(15);
    const newOrder = [...categories];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    onReorder(newOrder);
  };

  const handleDragStart = (index: number) => {
    dragItem.current = index;
    setDragIndex(index);
    triggerHaptic(20);
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
    setOverIndex(index);
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newOrder = [...categories];
      const [movedItem] = newOrder.splice(dragItem.current, 1);
      newOrder.splice(dragOverItem.current, 0, movedItem);
      onReorder(newOrder);
      triggerHaptic(15);
    }
    dragItem.current = null;
    dragOverItem.current = null;
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <div className="theme-page fixed inset-0 z-80 flex flex-col p-6 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onClose}
          className="p-3 bg-zinc-900 rounded-2xl active:scale-90 transition-transform outline-none border-none"
          aria-label="Back"
        >
          <ArrowLeftIcon />
        </button>
        <h2 className="text-2xl font-black">Manage Categories</h2>
      </div>

      <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-2 mb-8">
        <div className="flex gap-2">
          <input
            autoFocus
            value={newCat}
            onChange={(e) => { setNewCat(e.target.value); setError(null); }}
            placeholder="New Category..."
            className={`flex-1 h-14 bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-800'} rounded-2xl px-6 text-white font-bold outline-none transition-colors`}
          />
          <button
            type="button"
            aria-label="Add new category"
            disabled={!newCat.trim()}
            onClick={handleSubmit as any}
            className="h-14 w-14 text-black rounded-2xl font-black disabled:opacity-30 active:scale-95 transition-transform flex items-center justify-center shadow-lg outline-none border-none"
            style={{ backgroundColor: accentColor }}
          >
            <PlusIcon aria-hidden="true" size={30} strokeWidth={4} />
          </button>
        </div>
        {error && <p className="text-red-500 text-xs font-bold px-2 animate-pulse">{error}</p>}
      </form>

      <div className="flex-1 overflow-y-auto space-y-3 pb-32">
        <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest px-2 mb-1">
          Your Categories ({categories.length})
        </label>
        {categories.map((cat, index) => (
          <div
            key={cat}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`flex items-center justify-between border rounded-2xl transition-all cursor-grab active:cursor-grabbing select-none overflow-hidden ${
              dragIndex === index
                ? 'opacity-40 scale-95'
                : overIndex === index && dragIndex !== null && dragIndex !== index
                ? 'border-2 bg-zinc-900'
                : 'bg-zinc-950 border-zinc-900'
            }`}
            style={{ minHeight: 64, ...(overIndex === index && dragIndex !== null && dragIndex !== index ? { borderColor: accentColor } : {}) }}
          >
            <div className="flex flex-col items-center justify-center self-stretch rounded-l-2xl px-4" style={{ backgroundColor: accentColor, gap: 8, minWidth: 60 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); moveUp(index); }}
                  disabled={index === 0}
                  className="outline-none border-none bg-transparent p-0 leading-none active:scale-110 transition-all disabled:opacity-20"
                  aria-label="Move Up"
                >
                  <svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,13 13,3 24,13" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); moveDown(index); }}
                  disabled={index === categories.length - 1}
                  className="outline-none border-none bg-transparent p-0 leading-none active:scale-110 transition-all disabled:opacity-20"
                  aria-label="Move Down"
                >
                  <svg width="26" height="16" viewBox="0 0 26 16" fill="none" stroke="#000000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="2,3 13,13 24,3" />
                  </svg>
                </button>
              </div>
            <div className="flex items-center gap-4 py-4 px-5 flex-1">
              <div className="flex flex-col">
                <span className="font-bold leading-tight" style={{ fontFamily: '"Atkinson Hyperlegible", sans-serif', fontSize: '1.2rem' }}>{cat}</span>
                {isProtected(cat) && (
                  <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Built-in</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 pr-4">
              {canDelete(cat) ? (
                <button
                  onClick={() => onDelete(cat)}
                  className="text-red-500 p-2 active:scale-90 rounded-xl transition-all outline-none border-none bg-transparent"
                  aria-label={`Delete ${cat}`}
                >
                  <TrashIcon size={24} />
                </button>
              ) : (
                <div className="bg-zinc-900 p-3 rounded-xl opacity-30">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              )}
              {/* Drag handle — 2×3 dots */}
              <div className="flex flex-col gap-1 px-1" style={{ opacity: 1 }}>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#555' }} />
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#555' }} />
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#555' }} />
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#555' }} />
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#555' }} />
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: '#555' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagerModal;
