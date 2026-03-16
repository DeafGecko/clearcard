import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { NoteCard } from '../types';

interface CardEditorProps {
  onAdd: (title: string, content: string, category: string, fontSize: NoteCard['fontSize']) => void;
  theme: string;
}

const CATEGORIES = ['General', 'Medical', 'Shopping', 'Transportation', 'Social', 'Restaurant', 'Services', 'Emergency'];

export function CardEditor({ onAdd, theme }: CardEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [fontSize, setFontSize] = useState<NoteCard['fontSize']>('large');

  const themes: Record<string, { bg: string; text: string; input: string; border: string; btn: string }> = {
    'high-contrast': {
      bg: 'bg-gray-900',
      text: 'text-white',
      input: 'bg-black border-yellow-400 text-white focus:ring-yellow-400',
      border: 'border-yellow-400',
      btn: 'bg-yellow-400 text-black hover:bg-yellow-300',
    },
    dark: {
      bg: 'bg-gray-800',
      text: 'text-white',
      input: 'bg-gray-900 border-gray-600 text-white focus:ring-blue-400',
      border: 'border-gray-600',
      btn: 'bg-blue-500 text-white hover:bg-blue-400',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      input: 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500',
      border: 'border-gray-300',
      btn: 'bg-blue-600 text-white hover:bg-blue-500',
    },
  };

  const t = themes[theme] || themes['high-contrast'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd(title || 'My Card', content, category, fontSize);
    setTitle('');
    setContent('');
    setCategory('General');
    setFontSize('large');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg ${t.btn} transition-all hover:scale-105 active:scale-95`}
      >
        <Plus className="w-6 h-6" />
        New Card
      </button>
    );
  }

  return (
    <div className={`${t.bg} ${t.text} rounded-xl border-2 ${t.border} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Create New Card</h2>
        <button onClick={() => setIsOpen(false)} className="p-2 rounded hover:bg-white hover:bg-opacity-10">
          <X className="w-5 h-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Card Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g., My Name Is..."
            className={`w-full px-3 py-2 rounded-lg border-2 ${t.input} focus:outline-none focus:ring-2`}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Message <span className="text-red-400">*</span></label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Type your message here..."
            rows={4}
            required
            className={`w-full px-3 py-2 rounded-lg border-2 ${t.input} focus:outline-none focus:ring-2 resize-none`}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border-2 ${t.input} focus:outline-none focus:ring-2`}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Font Size</label>
            <select
              value={fontSize}
              onChange={e => setFontSize(e.target.value as NoteCard['fontSize'])}
              className={`w-full px-3 py-2 rounded-lg border-2 ${t.input} focus:outline-none focus:ring-2`}
            >
              <option value="normal">Normal</option>
              <option value="large">Large</option>
              <option value="xlarge">Extra Large</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className={`flex-1 py-3 rounded-xl font-bold ${t.btn} transition-all hover:scale-[1.02]`}
          >
            Create Card
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-6 py-3 rounded-xl font-bold border-2 border-gray-500 text-gray-400 hover:border-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
