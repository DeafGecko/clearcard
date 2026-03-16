import { useState } from 'react';
import { NoteCard as NoteCardComponent } from '../components/NoteCard';
import { CardEditor } from '../components/CardEditor';
import { useCards } from '../hooks/useCards';
import { Search } from 'lucide-react';

interface CardsPageProps {
  theme: string;
}

export function CardsPage({ theme }: CardsPageProps) {
  const { cards, addCard, updateCard, deleteCard, togglePin } = useCards();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const themes: Record<string, { bg: string; text: string; sub: string; input: string; border: string; chip: string; chipActive: string }> = {
    'high-contrast': {
      bg: 'bg-black',
      text: 'text-white',
      sub: 'text-gray-400',
      input: 'bg-gray-900 border-yellow-400 text-white placeholder-gray-500',
      border: 'border-yellow-400',
      chip: 'bg-gray-800 text-gray-300 hover:bg-gray-700',
      chipActive: 'bg-yellow-400 text-black font-bold',
    },
    dark: {
      bg: 'bg-gray-900',
      text: 'text-white',
      sub: 'text-gray-400',
      input: 'bg-gray-800 border-gray-600 text-white placeholder-gray-500',
      border: 'border-gray-600',
      chip: 'bg-gray-700 text-gray-300 hover:bg-gray-600',
      chipActive: 'bg-blue-500 text-white font-bold',
    },
    light: {
      bg: 'bg-gray-50',
      text: 'text-gray-900',
      sub: 'text-gray-600',
      input: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
      border: 'border-gray-300',
      chip: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100',
      chipActive: 'bg-blue-600 text-white font-bold',
    },
  };

  const t = themes[theme] || themes['high-contrast'];

  const categories = ['All', ...Array.from(new Set(cards.map(c => c.category)))];

  const filtered = cards.filter(card => {
    const matchesSearch = search === '' ||
      card.title.toLowerCase().includes(search.toLowerCase()) ||
      card.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`min-h-screen ${t.bg} ${t.text}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black mb-1">My Communication Cards</h1>
          <p className={`${t.sub} text-lg`}>High-contrast cards for clear communication</p>
        </div>

        {/* Card Editor */}
        <div className="mb-8">
          <CardEditor onAdd={addCard} theme={theme} />
        </div>

        {/* Search & Filter */}
        {cards.length > 0 && (
          <div className="mb-6 space-y-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${t.sub}`} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search cards..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 ${t.input} focus:outline-none focus:ring-2 focus:ring-yellow-400`}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
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
        )}

        {/* Cards Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            {cards.length === 0 ? (
              <>
                <div className="text-6xl mb-4">🃏</div>
                <h2 className="text-2xl font-bold mb-2">No cards yet</h2>
                <p className={t.sub}>Create your first communication card above!</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-2">No matches</h2>
                <p className={t.sub}>Try a different search or category</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(card => (
              <NoteCardComponent
                key={card.id}
                card={card}
                onUpdate={updateCard}
                onDelete={deleteCard}
                onTogglePin={togglePin}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
