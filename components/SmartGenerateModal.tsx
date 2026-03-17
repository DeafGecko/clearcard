import React, { useState } from 'react';
import { generateSmartCard } from '../services/geminiService';
import { SparklesIcon } from './Icons';
import { Category } from '../types';
import { Copy, Check, Briefcase, Smile, Wand2, PenLine } from 'lucide-react';

interface SmartGenerateModalProps {
  categories: Category[];
  onGenerated: (card: { title: string; content: string; category: Category }) => void;
  onClose: () => void;
  accentColor: string;
}

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Spanish', label: 'Spanish' },
  { code: 'French', label: 'French' },
  { code: 'Chinese', label: 'Chinese' },
  { code: 'Arabic', label: 'Arabic' },
  { code: 'Portuguese', label: 'Portuguese' },
  { code: 'German', label: 'German' },
  { code: 'Japanese', label: 'Japanese' },
  { code: 'Korean', label: 'Korean' },
  { code: 'Italian', label: 'Italian' },
];

const SmartGenerateModal: React.FC<SmartGenerateModalProps> = ({ categories, onGenerated, onClose, accentColor }) => {
  const [tab, setTab] = useState<'generate' | 'grammar'>('generate');

  // Generate tab state
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState<'english' | 'spanish'>('english');
  const [tone, setTone] = useState<'professional' | 'casual'>('professional');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ title: string; content: string; category: Category } | null>(null);
  const [copied, setCopied] = useState(false);

  // Grammar tab state
  const [grammarText, setGrammarText] = useState('');
  const [grammarLang, setGrammarLang] = useState('English');
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState('');
  const [grammarCopied, setGrammarCopied] = useState(false);
  const [showAllLangs, setShowAllLangs] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const generated = await generateSmartCard(prompt, categories, language, tone);
      setResult(generated);
    } catch {
      alert('Failed to generate. Please try again.');
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

  const handleGrammarFix = async () => {
    if (!grammarText.trim()) return;
    setGrammarLoading(true);
    setGrammarResult('');
    try {
      const response = await fetch('/api/grammar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: grammarText, language: grammarLang }),
      });
      const data = await response.json();
      setGrammarResult(data.corrected || grammarText);
    } catch {
      // Fallback: basic local fix
      setGrammarResult(grammarText.trim().charAt(0).toUpperCase() + grammarText.trim().slice(1).replace(/\s+/g, ' '));
    } finally {
      setGrammarLoading(false);
    }
  };

  const handleGrammarCopy = () => {
    navigator.clipboard.writeText(grammarResult);
    setGrammarCopied(true);
    setTimeout(() => setGrammarCopied(false), 2000);
  };

  const handleSaveCard = () => {
    if (!result) return;
    onGenerated(result);
  };

  const handleSaveGrammarAsCard = () => {
    if (!grammarResult) return;
    onGenerated({
      title: grammarText.split(' ').slice(0, 4).join(' '),
      content: grammarResult,
      category: categories[0],
    });
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
            {tab === 'generate' && (['english', 'spanish'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`py-1.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${language === lang ? 'text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
                style={language === lang ? { backgroundColor: accentColor } : {}}
              >
                {lang === 'english' ? '🇺🇸 English' : '🇲🇽 Spanish'}
              </button>
            ))}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded-xl text-zinc-400 font-black text-sm">✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTab('generate')}
            className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${tab === 'generate' ? 'text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            style={tab === 'generate' ? { backgroundColor: accentColor } : {}}
          >
            <Wand2 size={14} /> Generate Card
          </button>
          <button
            onClick={() => setTab('grammar')}
            className={`py-3 rounded-2xl font-black text-xs uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${tab === 'grammar' ? 'text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
            style={tab === 'grammar' ? { backgroundColor: accentColor } : {}}
          >
            <PenLine size={14} /> Fix Grammar
          </button>
        </div>

        {/* GENERATE TAB */}
        {tab === 'generate' && (
          <>
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

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt.trim()}
              className="w-full py-4 text-black rounded-2xl font-black hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><SparklesIcon /> Generate</>}
            </button>

            {result && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-base">{result.title}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest mt-0.5" style={{ color: accentColor }}>{result.category}</p>
                  </div>
                </div>
                <p className="text-white font-medium leading-relaxed text-sm border-t border-zinc-800 pt-3">{result.content}</p>
                <button
                  onClick={handleCopy}
                  className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border border-zinc-700"
                  style={copied ? { backgroundColor: accentColor, color: 'black', borderColor: accentColor } : { backgroundColor: '#27272a', color: 'white' }}
                >
                  {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Tap to Copy Text</>}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setResult(null)} className="flex-1 py-3 bg-zinc-800 rounded-xl font-black text-xs uppercase tracking-widest">Try Again</button>
                  <button onClick={handleSaveCard} className="flex-1 py-3 text-black rounded-xl font-black text-xs uppercase tracking-widest" style={{ backgroundColor: accentColor }}>Save as Card</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* GRAMMAR TAB */}
        {tab === 'grammar' && (
          <>
            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Language</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {LANGUAGES.slice(0, showAllLangs ? LANGUAGES.length : 4).map(lang => (
                  <button
                    key={lang.code}
                    onClick={() => setGrammarLang(lang.code)}
                    className={`py-2.5 rounded-2xl font-black text-xs border transition-all ${grammarLang === lang.code ? 'text-black border-transparent' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}
                    style={grammarLang === lang.code ? { backgroundColor: accentColor } : {}}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAllLangs(!showAllLangs)}
                className="w-full py-2 rounded-xl font-black text-[10px] uppercase tracking-widest bg-zinc-800 text-zinc-500 border border-zinc-700"
              >
                {showAllLangs ? 'Show Less' : 'More Languages'}
              </button>
            </div>

            <div>
              <label className="block text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-2">Your Text</label>
              <textarea
                autoFocus
                value={grammarText}
                onChange={(e) => setGrammarText(e.target.value)}
                placeholder="Type or paste your text here to fix grammar..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-white focus:outline-none min-h-[110px] font-medium resize-none"
              />
            </div>

            <button
              onClick={handleGrammarFix}
              disabled={grammarLoading || !grammarText.trim()}
              className="w-full py-4 text-black rounded-2xl font-black disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: accentColor }}
            >
              {grammarLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><PenLine size={16} /> Fix Grammar</>}
            </button>

            {grammarResult && (
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3 animate-in fade-in zoom-in duration-200">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>Corrected Text</p>
                <p className="text-white font-medium leading-relaxed text-sm">{grammarResult}</p>
                <button
                  onClick={handleGrammarCopy}
                  className="w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 border border-zinc-700"
                  style={grammarCopied ? { backgroundColor: accentColor, color: 'black', borderColor: accentColor } : { backgroundColor: '#27272a', color: 'white' }}
                >
                  {grammarCopied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Tap to Copy</>}
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setGrammarResult('')} className="flex-1 py-3 bg-zinc-800 rounded-xl font-black text-xs uppercase tracking-widest">Try Again</button>
                  <button onClick={handleSaveGrammarAsCard} className="flex-1 py-3 text-black rounded-xl font-black text-xs uppercase tracking-widest" style={{ backgroundColor: accentColor }}>Save as Card</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SmartGenerateModal;
