import { useState } from 'react';
import { BUILT_IN_TEMPLATES, TEMPLATE_CATEGORIES, generateAITemplate } from '../utils/templates';
import { Template } from '../types';
import { useCards } from '../hooks/useCards';
import { Sparkles, Plus, Search, Copy, Check } from 'lucide-react';

interface TemplatesPageProps {
  theme: string;
}

export function TemplatesPage({ theme }: TemplatesPageProps) {
  const { addCard } = useCards();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedTemplate, setGeneratedTemplate] = useState<Template | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const themes: Record<string, {
    bg: string; text: string; sub: string; card: string; input: string;
    border: string; chip: string; chipActive: string; btn: string; aiBg: string;
  }> = {
    'high-contrast': {
      bg: 'bg-black',
      text: 'text-white',
      sub: 'text-gray-400',
      card: 'bg-gray-900 border-gray-700 hover:border-yellow-400',
      input: 'bg-black border-yellow-400 text-white placeholder-gray-500',
      border: 'border-yellow-400',
      chip: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
      chipActive: 'bg-yellow-400 text-black font-bold',
      btn: 'bg-yellow-400 text-black hover:bg-yellow-300 font-bold',
      aiBg: 'bg-gray-900 border-yellow-400',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      sub: 'text-gray-400',
      card: 'bg-gray-800 border-gray-600 hover:border-blue-400',
      input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-500',
      border: 'border-gray-600',
      chip: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
      chipActive: 'bg-blue-500 text-white font-bold',
      btn: 'bg-blue-500 text-white hover:bg-blue-400 font-bold',
      aiBg: 'bg-gray-800 border-gray-600',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      sub: 'text-gray-600',
      card: 'bg-white border-gray-200 hover:border-blue-400',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
      border: 'border-gray-300',
      chip: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100',
      chipActive: 'bg-blue-600 text-white font-bold',
      btn: 'bg-blue-600 text-white hover:bg-blue-500 font-bold',
      aiBg: 'bg-white border-gray-300',
    },
  };

  const t = themes[theme] || themes['high-contrast'];

  const filtered = BUILT_IN_TEMPLATES.filter(template => {
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = search === '' ||
      template.title.toLowerCase().includes(search.toLowerCase()) ||
      template.content.toLowerCase().includes(search.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const template = generateAITemplate(aiPrompt);
    setGeneratedTemplate(template);
    setIsGenerating(false);
  };

  const handleCopy = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCard = (template: Template) => {
    addCard(template.title, template.content, template.category, 'large');
    setAddedId(template.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const TemplateCard = ({ template }: { template: Template }) => (
    <div className={`border-2 rounded-xl p-4 transition-all ${t.card}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-base leading-tight">{template.title}</h3>
          <span className={`text-xs ${t.sub}`}>{template.category}</span>
        </div>
        <div className="flex gap-2 ml-2 shrink-0">
          <button
            onClick={() => handleCopy(template.id, template.content)}
            className={`p-1.5 rounded-lg text-sm flex items-center gap-1 ${t.sub} transition-colors`}
            title="Copy to clipboard"
          >
            {copiedId === template.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleAddCard(template)}
            className={`p-1.5 rounded-lg text-sm flex items-center gap-1 ${
              addedId === template.id ? 'text-green-500' : t.sub
            } transition-colors`}
            title="Add to My Cards"
          >
            {addedId === template.id ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <p className={`text-sm ${t.sub} whitespace-pre-wrap leading-relaxed`}>{template.content}</p>
      <div className="flex flex-wrap gap-1 mt-3">
        {template.tags.map(tag => (
          <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${t.chip}`}>{tag}</span>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${t.bg} ${t.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">Communication Templates</h1>
          <p className={`${t.sub} text-lg`}>Ready-made cards for common situations</p>
        </div>

        {/* AI Generator */}
        <div className={`border-2 rounded-xl p-6 mb-8 ${t.aiBg}`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h2 className="font-bold text-lg">AI Template Generator</h2>
          </div>
          <p className={`${t.sub} text-sm mb-4`}>
            Describe what you need and we'll generate a communication card for you.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g., I need help at the pharmacy picking up my prescription"
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 ${t.input} focus:outline-none focus:ring-2`}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !aiPrompt.trim()}
              className={`px-5 py-2.5 rounded-xl ${t.btn} transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-2`}
            >
              <Sparkles className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {generatedTemplate && (
            <div className="mt-4 p-4 bg-black bg-opacity-30 rounded-xl border border-yellow-400 border-opacity-30">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold">{generatedTemplate.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(generatedTemplate.id, generatedTemplate.content)}
                    className="flex items-center gap-1 text-sm px-3 py-1 rounded-lg border border-current opacity-70 hover:opacity-100"
                  >
                    {copiedId === generatedTemplate.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                  <button
                    onClick={() => handleAddCard(generatedTemplate)}
                    className={`flex items-center gap-1 text-sm px-3 py-1 rounded-lg ${t.btn}`}
                  >
                    <Plus className="w-3 h-3" />
                    Add to Cards
                  </button>
                </div>
              </div>
              <p className="text-sm whitespace-pre-wrap">{generatedTemplate.content}</p>
            </div>
          )}
        </div>

        {/* Search & Filter */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${t.sub}`} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 ${t.input} focus:outline-none focus:ring-2`}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  selectedCategory === cat ? t.chipActive : t.chip
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold mb-2">No templates found</h2>
            <p className={t.sub}>Try a different search term or category</p>
          </div>
        )}
      </div>
    </div>
  );
}
