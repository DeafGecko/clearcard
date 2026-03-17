import React, { useState } from 'react';
import { generateSmartCard } from '../services/geminiService';
import { SparklesIcon } from './Icons';
import { Category } from '../types';
import { Copy, Check, Briefcase, Smile } from 'lucide-react';

interface SmartGenerateModalProps {
  categories: Category[];
  onGenerated: (card: { title: string; content: string; category: Category }) => void;
  onClose: () => void;
  accentColor: string;
}

const SmartGenerateModal: React.FC<SmartGenerateModalProps> = ({ categories, onGenerated, onClose, accentColor }) => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<'english' | 'spanish'>('english');
  const [tone, setTone] = useState<'professional' | 'casual'>('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string; category: Category } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const generated = await generateSmartCard(prompt, categories, language, tone);
      setResult(generated);
    } catch (err) {
      alert("Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCard = () => {
    if (!result) return;
    onGenerated(result);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
      <div className="bg-zinc-900 w-full max-w-lg rounded-3xl border border-zinc-800 shadow-2xl p-6 animate-in slide-in-from-bottom duration-300 space-y-5 overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold" style={{ color: accentColor }}>
            <SparklesIcon />
            <span>Smart Generate</span>
          </div>
          <div className="flex items-center gap-2">
            {(['english', 'spanish'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-1.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${language === lang ? 'text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
                style={language === lang ? { backgroundColor: accentColor } : {}}
              >
                {lang === 'english' ? '🇺🇸 EN' : '🇲🇽 ES'}
              </button>
            ))}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-xl text-zinc-400 font-black text-sm">✕</button>
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Describe your situation</label>
          <textarea
            autoFocus
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. I am at the dentist for a checkup..."
            className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none min-h-[90px] font-medium resize-none"
          />
        </div>

        {/* Tone */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTone('professional')}
            className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${tone === 'professional' ? 'text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            style={tone === 'professional' ? { backgroundColor: accentColor } : {}}
          >
            <Briefcase size={14} /> Professional
          </button>
          <button
            onClick={() => setTone('casual')}
            className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${tone === 'casual' ? 'text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            style={tone === 'casual' ? { backgroundColor: accentColor } : {}}
          >
            <Smile size={14} /> Casual
          </button>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="w-full py-4 text-black rounded-2xl font-black hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <><SparklesIcon /> Generate</>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-black text-base">{result.title}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: accentColor }}>{result.category}</p>
              </div>
              <button
                onClick={handleCopy}
                className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center transition-all active:scale-90"
                style={copied ? { backgroundColor: accentColor } : {}}
              >
                {copied ? <Check size={16} color="black" /> : <Copy size={16} />}
              </button>
            </div>

            <p className="text-white font-medium leading-relaxed text-sm border-t border-zinc-800 pt-3">
              {result.content}
            </p>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setResult(null)}
                className="flex-1 py-3 bg-zinc-800 rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Try Again
              </button>
              <button
                onClick={handleSaveCard}
                className="flex-1 py-3 text-black rounded-xl font-black text-xs uppercase tracking-widest"
                style={{ backgroundColor: accentColor }}
              >
                Save as Card
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartGenerateModal;
