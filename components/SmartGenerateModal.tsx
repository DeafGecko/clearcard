
import React, { useState } from 'react';
import { generateSmartCard } from '../services/geminiService';
import { SparklesIcon } from './Icons';
import { Category } from '../types';

interface SmartGenerateModalProps {
  categories: Category[];
  onGenerated: (card: { title: string; content: string; category: Category }) => void;
  onClose: () => void;
  accentColor: string;
}

const SmartGenerateModal: React.FC<SmartGenerateModalProps> = ({ categories, onGenerated, onClose, accentColor }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const result = await generateSmartCard(prompt, categories);
      onGenerated(result);
    } catch (err) {
      alert("Failed to generate card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden p-6 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2 font-bold mb-4" style={{ color: accentColor }}>
          <SparklesIcon />
          <span>ClearCard AI Designer</span>
        </div>
        
        <h2 className="text-xl font-bold mb-2">What do you want to say?</h2>
        <p className="text-zinc-400 mb-6 text-sm">Describe your situation (e.g., "I'm at the pharmacy for a flu shot") and ClearCard will draft a card for you.</p>

        <textarea
          autoFocus
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="I'm at the dentist..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none min-h-[120px] mb-6"
          style={{ '--focus-border': accentColor } as any}
        />

        <div className="flex gap-4">
          <button 
            onClick={onClose}
            className="flex-1 py-4 bg-zinc-800 rounded-2xl font-bold hover:bg-zinc-700 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex-1 py-4 text-black rounded-2xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <SparklesIcon />
                Generate
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartGenerateModal;
