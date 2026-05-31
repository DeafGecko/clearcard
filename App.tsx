import React, { useState, useEffect } from 'react';
import { VisioCard, Category, UserPreferences, SystemCategories } from './types';
import { storage } from './lib/storage';
import { Settings, FileKey } from 'lucide-react';
import {
  CrossIcon,
  TrashIcon,
  PlusIcon,
  EditIcon,
  MedicalIcon,
  DailyIcon,
  ServiceIcon,
} from './components/Icons';
import FullscreenViewer from './components/FullscreenViewer';
import CardEditorModal from './components/CardEditorModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import PasscodeModal from './components/PasscodeModal';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [cards, setCards] = useState<VisioCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prefs, setPrefs] = useState<UserPreferences>(storage.getPrefs());
  const [selectedCard, setSelectedCard] = useState<VisioCard | null>(null);
  const [editingCard, setEditingCard] = useState<VisioCard | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);

  useEffect(() => {
    setCards(storage.getCards());
    setCategories(storage.getCategories());
  }, []);

  useEffect(() => {
    const lang = prefs.appLanguage || 'en';
    document.documentElement.lang = lang;
    if (lang === 'en') {
      document.documentElement.removeAttribute('translate');
    } else {
      document.documentElement.setAttribute('translate', 'yes');
    }
  }, [prefs.appLanguage]);

  const triggerHaptic = (ms: number = 10) => {
    if ('vibrate' in navigator) navigator.vibrate(ms);
  };

  const handleUpdatePrefs = (newPrefs: UserPreferences) => {
    setPrefs(newPrefs);
    storage.savePrefs(newPrefs);
    triggerHaptic(50);
  };

  const handleSaveCard = (
    data: { title: string; content: string; category: Category },
    id?: string
  ) => {
    setCards(prevCards => {
      let nextCards: VisioCard[];
      if (id) {
        nextCards = prevCards.map(c =>
          c.id === id
            ? {
                ...c,
                ...data,
                isSensitive:
                  data.category === SystemCategories.MEDICAL ||
                  data.category === SystemCategories.VAULT,
                isLocked: data.category === SystemCategories.VAULT,
              }
            : c
        );
      } else {
        const newCard: VisioCard = {
          id: Math.random().toString(36).substr(2, 9),
          title: data.title,
          content: data.content,
          category: data.category,
          isSensitive:
            data.category === SystemCategories.MEDICAL ||
            data.category === SystemCategories.VAULT,
          isLocked: data.category === SystemCategories.VAULT,
          createdAt: Date.now(),
        };
        nextCards = [newCard, ...prevCards];
      }
      storage.saveCards(nextCards);
      return nextCards;
    });
    setShowEditorModal(false);
    setEditingCard(null);
    triggerHaptic(50);
  };

  const deleteCard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic(100);
    setCards(prev => {
      const next = prev.filter(c => c.id !== id);
      storage.saveCards(next);
      return next;
    });
  };

  const startEditing = (card: VisioCard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerHaptic(20);
    setSelectedCard(null);
    setEditingCard(card);
    setShowEditorModal(true);
  };

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!categories.some(c => c.toLowerCase() === trimmed.toLowerCase())) {
      setCategories(prev => {
        const next = [...prev, trimmed];
        storage.saveCategories(next);
        return next;
      });
      triggerHaptic(40);
    }
  };

  const handleDeleteCategory = (name: string) => {
    if (
      name === SystemCategories.VAULT ||
      name === SystemCategories.EMERGENCY
    )
      return;
    setCategories(prev => {
      const remainingCats = prev.filter(c => c !== name);
      const reachableCats = remainingCats.filter(
        c =>
          ![SystemCategories.VAULT, SystemCategories.EMERGENCY].includes(
            c as any
          )
      );
      const fallback =
        reachableCats.length > 0 ? reachableCats[0] : SystemCategories.DAILY;
      setCards(prevCards => {
        const nextCards = prevCards.map(c =>
          c.category === name ? { ...c, category: fallback } : c
        );
        storage.saveCards(nextCards);
        return nextCards;
      });
      storage.saveCategories(remainingCats);
      return remainingCats;
    });
    if (activeCategory === name) setActiveCategory('All');
    triggerHaptic(80);
  };

  const handleReorderCategories = (newOrder: Category[]) => {
    setCategories(newOrder);
    storage.saveCategories(newOrder);
  };

  const handlePasscodeVerify = (code: string) => {
    if (code === prefs.passcode) {
      setIsVaultUnlocked(true);
      setShowPasscodeModal(false);
      return true;
    }
    return false;
  };

  const handleLockToggle = () => {
    triggerHaptic(20);
    if (isVaultUnlocked) {
      setIsVaultUnlocked(false);
    } else {
      setShowPasscodeModal(true);
    }
  };

  const filteredCards = cards.filter(c => {
    if (activeCategory === 'All')
      return (
        c.category !== SystemCategories.VAULT &&
        c.category !== SystemCategories.EMERGENCY
      );
    if (activeCategory === SystemCategories.VAULT)
      return c.category === SystemCategories.VAULT && isVaultUnlocked;
    if (activeCategory === SystemCategories.EMERGENCY)
      return c.category === SystemCategories.EMERGENCY;
    return c.category === activeCategory;
  });

  const getCatIcon = (cat: Category) => {
    switch (cat) {
      case SystemCategories.MEDICAL:
        return <MedicalIcon />;
      case SystemCategories.DAILY:
        return <DailyIcon />;
      case SystemCategories.SERVICES:
        return <ServiceIcon />;
      case SystemCategories.EMERGENCY:
        return <CrossIcon />;
      default:
        return (
          <div className="text-zinc-600 font-bold">
            {cat[0]?.toUpperCase() || '?'}
          </div>
        );
    }
  };

  const otherCats = categories.filter(
    c => c !== SystemCategories.EMERGENCY
  );
  const accentColor = prefs.accentColor;
  const emergencyColor = '#E53935';

  return (
    <div className="min-h-screen bg-black text-white pb-40 landscape:pb-24 select-none">
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-black/95 backdrop-blur-xl border-b border-zinc-900 px-6 pt-12 landscape:pt-4 pb-6 landscape:pb-2 flex justify-between items-end">
        <div>
          <h1 className="text-4xl landscape:text-2xl font-black tracking-tighter leading-none mb-1 uppercase">
            ClearCard
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] landscape:hidden">
            Smart Vis-Com Cards
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              triggerHaptic(15);
              setShowSettingsModal(true);
            }}
            aria-label="Settings"
            className="h-11 w-11 rounded-2xl flex items-center justify-center bg-zinc-900 text-zinc-600 active:text-white transition-all"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLockToggle}
            aria-label={
              isVaultUnlocked ? 'Lock Private Info' : 'Unlock Private Info'
            }
            className={`h-11 w-11 rounded-2xl flex items-center justify-center transition-all ${
              isVaultUnlocked
                ? 'text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : 'bg-zinc-900 text-zinc-600'
            }`}
            style={isVaultUnlocked ? { backgroundColor: accentColor } : {}}
          >
            <FileKey size={20} />
          </button>
        </div>
      </header>

      {/* CATEGORY NAV */}
      <nav className="sticky top-27 landscape:top-16 z-30 bg-black/95 backdrop-blur-xl py-4 landscape:py-2 overflow-x-auto whitespace-nowrap px-6 no-scrollbar flex items-center gap-2">
        <button
          onClick={() => {
            triggerHaptic(50);
            setActiveCategory(SystemCategories.EMERGENCY);
          }}
          className={`h-11 w-11 landscape:h-9 landscape:w-9 shrink-0 rounded-2xl flex items-center justify-center transition-all text-white shadow-lg ${
            activeCategory === SystemCategories.EMERGENCY
              ? 'scale-110 z-10 ring-2 ring-white/80'
              : 'opacity-90 hover:opacity-100'
          }`}
          style={{
            backgroundColor: emergencyColor,
            boxShadow:
              activeCategory === SystemCategories.EMERGENCY
                ? '0 0 20px rgba(229, 57, 53, 0.7)'
                : undefined,
          }}
          aria-label="Emergency"
        >
          <CrossIcon />
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveCategory('All');
            setIsVaultUnlocked(false);
          }}
          className={`px-6 py-3 landscape:py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
            activeCategory === 'All'
              ? 'text-black'
              : 'bg-zinc-900 text-zinc-500 border-zinc-800'
          }`}
          style={
            activeCategory === 'All'
              ? { backgroundColor: accentColor, borderColor: accentColor }
              : {}
          }
        >
          All
        </button>

        {otherCats.map(cat => (
          <button
            key={cat}
            onClick={() => {
              triggerHaptic();
              setActiveCategory(cat as any);
            }}
            className={`px-6 py-3 landscape:py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border ${
              activeCategory === cat
                ? 'text-black'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
            style={
              activeCategory === cat
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : {}
            }
          >
            {cat}
          </button>
        ))}

        <button
          onClick={() => {
            triggerHaptic(15);
            setShowCatModal(true);
          }}
          className="px-4 py-3 landscape:py-2 bg-zinc-900 rounded-2xl border border-zinc-800 font-black text-xs uppercase tracking-widest active:scale-95 transition-transform"
          style={{ color: accentColor }}
        >
          Modify
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="px-6 mt-6 landscape:mt-2">
        {activeCategory === SystemCategories.VAULT && !isVaultUnlocked ? (
          <div className="flex flex-col items-center justify-center py-20 landscape:py-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 landscape:w-16 landscape:h-16 bg-zinc-900 rounded-[40px] flex items-center justify-center mb-8 landscape:mb-4 text-zinc-600">
              <FileKey size={20} />
            </div>
            <h2 className="text-2xl landscape:text-lg font-black mb-3">
              Vault is Locked
            </h2>
            <p className="text-zinc-500 mb-10 landscape:mb-6 max-w-xs leading-relaxed font-medium landscape:text-sm">
              Access your highly sensitive personal information securely.
            </p>
            <button
              onClick={() => {
                triggerHaptic(40);
                setShowPasscodeModal(true);
              }}
              className="w-full max-w-sm h-16 landscape:h-12 bg-white text-black rounded-3xl font-black text-lg landscape:text-sm active:scale-95 transition-transform"
            >
              UNLOCK VAULT
            </button>
          </div>
        ) : (
          <div
            className="grid grid-cols-1 gap-3 landscape:grid-cols-2"
            role="list"
          >
            {filteredCards.length === 0 ? (
              <div className="py-20 text-center text-zinc-600 font-bold uppercase tracking-widest text-xs col-span-full">
                No cards in {activeCategory}
              </div>
            ) : (
              filteredCards.map(card => (
                <article
                  key={card.id}
                  role="listitem"
                  onClick={() => {
                    triggerHaptic(15);
                    setSelectedCard(card);
                  }}
                  className="group relative bg-zinc-950 border border-zinc-900 px-4 py-5 landscape:py-3 rounded-[28px] cursor-pointer active:bg-zinc-900 transition-all flex items-center gap-4 overflow-hidden"
                  style={
                    { '--accent-color': accentColor } as React.CSSProperties
                  }
                >
                  <div
                    className={`shrink-0 w-12 h-12 landscape:w-10 landscape:h-10 flex items-center justify-center rounded-2xl ${
                      card.category === SystemCategories.EMERGENCY
                        ? 'text-white'
                        : 'bg-zinc-900 text-zinc-500'
                    }`}
                    style={
                      card.category === SystemCategories.EMERGENCY
                        ? {
                            backgroundColor: emergencyColor,
                            boxShadow: '0 4px 12px rgba(229, 57, 53, 0.4)',
                          }
                        : {}
                    }
                  >
                    {getCatIcon(card.category)}
                  </div>

                  <div className="flex-1 min-w-0 pr-20">
                    <h3 className="text-lg landscape:text-base font-black truncate group-hover:text-(--accent-color) transition-colors">
                      {card.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[9px] font-black uppercase tracking-widest"
                        style={
                          card.category === SystemCategories.EMERGENCY
                            ? { color: emergencyColor }
                            : { color: '#52525b' }
                        }
                      >
                        {card.category}
                      </span>
                    </div>
                  </div>

                  <div className="absolute right-2 flex items-center gap-0.5">
                    <button
                      onClick={e => startEditing(card, e)}
                      className="h-10 w-10 flex items-center justify-center text-zinc-700 hover:text-white active:scale-125 transition-all"
                      aria-label="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={e => deleteCard(card.id, e)}
                      className="h-10 w-10 flex items-center justify-center text-zinc-700 hover:text-red-500 active:scale-125 transition-all"
                      aria-label="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </main>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-20 bg-black/95 backdrop-blur-xl border-t border-zinc-900 px-8 pb-8 pt-4 flex items-center justify-center">
        <button
          onClick={() => {
            triggerHaptic(10);
            setEditingCard(null);
            setShowEditorModal(true);
          }}
          className="w-14 h-14 rounded-2xl text-black flex items-center justify-center active:scale-95 transition-all shadow-lg"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 8px 24px ${accentColor}50`,
          }}
          aria-label="New Card"
        >
          <PlusIcon />
        </button>
      </div>

      {/* MODALS */}
      {selectedCard && (
        <FullscreenViewer
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onEdit={card => startEditing(card)}
          initialFontSize={prefs.fontSize}
          accentColor={accentColor}
          displayTextColor={prefs.displayTextColor}
        />
      )}
      {showEditorModal && (
        <CardEditorModal
          categories={categories}
          onClose={() => {
            setShowEditorModal(false);
            setEditingCard(null);
          }}
          onSave={data => handleSaveCard(data, editingCard?.id)}
          initialData={editingCard || undefined}
          accentColor={accentColor}
          passcode={prefs.passcode}
        />
      )}
      {showCatModal && (
        <CategoryManagerModal
          categories={categories}
          onAdd={handleAddCategory}
          onDelete={handleDeleteCategory}
          onReorder={handleReorderCategories}
          onClose={() => setShowCatModal(false)}
          accentColor={accentColor}
        />
      )}
      {showPasscodeModal && (
        <PasscodeModal
          onVerify={handlePasscodeVerify}
          onClose={() => setShowPasscodeModal(false)}
          accentColor={accentColor}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          prefs={prefs}
          onSave={handleUpdatePrefs}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default App;