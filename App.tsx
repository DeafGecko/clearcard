import React, { useState, useEffect, useRef } from 'react';
import { VisioCard, Category, UserPreferences, SystemCategories } from './types';
import { storage } from './lib/storage';
import { Settings, FileKey, LogOut, Menu, X } from 'lucide-react';
import {
  TrashIcon,
  PlusIcon,
  EditIcon,
  MedicalIcon,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSwipeCardId, setOpenSwipeCardId] = useState<string | null>(null);
  const swipeStartX = useRef(0);
  const didSwipe = useRef(false);

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

  useEffect(() => {
    document.documentElement.style.colorScheme = prefs.themeMode === 'light' ? 'light' : 'dark';
  }, [prefs.themeMode]);

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

  const deleteCard = (id: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    triggerHaptic(100);
    setOpenSwipeCardId(null);
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

  const handleSwipeStart = (event: React.TouchEvent, cardId: string) => {
    if (!window.matchMedia('(max-width: 1024px)').matches) return;
    swipeStartX.current = event.touches[0].clientX;
    didSwipe.current = false;
    if (openSwipeCardId && openSwipeCardId !== cardId) {
      setOpenSwipeCardId(null);
    }
  };

  const handleSwipeEnd = (event: React.TouchEvent, cardId: string) => {
    if (!window.matchMedia('(max-width: 1024px)').matches) return;
    const distance = event.changedTouches[0].clientX - swipeStartX.current;
    if (distance < -45) {
      didSwipe.current = true;
      setOpenSwipeCardId(cardId);
      triggerHaptic(20);
    } else if (distance > 45) {
      didSwipe.current = true;
      setOpenSwipeCardId(null);
    }
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

  const otherCats = categories.filter(
    c => c !== SystemCategories.EMERGENCY
  );
  const accentColor = prefs.accentColor;
  const emergencyColor = '#E53935';

  return (
    <div
      className="app-shell select-none"
      data-theme={prefs.themeMode || 'light'}
      data-display-size={prefs.displaySize || 'normal'}
    >
      {/* HEADER */}
      <header className="app-header relative shrink-0 z-40 px-4 sm:px-6 pt-12 landscape:pt-4 pb-6 landscape:pb-2 flex justify-between items-end overflow-visible">
        <div>
          <h1 className="text-3xl sm:text-4xl landscape:text-2xl font-black leading-none mb-1 uppercase">
            ClearCard
          </h1>
          <p className="brand-motto text-zinc-500">
            Communication made clear.
          </p>
        </div>
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => {
              triggerHaptic(15);
              setShowSettingsModal(true);
            }}
            aria-label="Settings"
            className="header-utility h-15 w-15 rounded-lg flex items-center justify-center bg-zinc-900 text-zinc-600 active:text-white transition-all"
          >
            <Settings size={28} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleLockToggle}
            aria-label={
              isVaultUnlocked ? 'Lock Private Info' : 'Unlock Private Info'
            }
            className={`header-utility h-15 w-15 rounded-lg flex items-center justify-center transition-all ${
              isVaultUnlocked
                ? 'text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : 'bg-zinc-900 text-zinc-600'
            }`}
            style={isVaultUnlocked ? { backgroundColor: accentColor } : {}}
          >
            <LogOut size={28} strokeWidth={2.5} />
          </button>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(isOpen => !isOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-header-menu"
          className="header-utility md:hidden h-15 w-15 rounded-lg flex items-center justify-center bg-zinc-900 text-zinc-600 active:text-white transition-all"
        >
          {isMobileMenuOpen ? <X size={30} strokeWidth={2.5} /> : <Menu size={30} strokeWidth={2.5} />}
        </button>

        {isMobileMenuOpen && (
          <div id="mobile-header-menu" className="mobile-header-menu md:hidden absolute right-4 top-full w-64 p-2 rounded-lg shadow-2xl z-50">
            <button
              onClick={() => {
                triggerHaptic(15);
                setShowSettingsModal(true);
                setIsMobileMenuOpen(false);
              }}
              className="mobile-header-menu-item"
            >
              <Settings size={24} strokeWidth={2.5} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => {
                handleLockToggle();
                setIsMobileMenuOpen(false);
              }}
              className="mobile-header-menu-item"
            >
              <LogOut size={24} strokeWidth={2.5} />
              <span>{isVaultUnlocked ? 'Lock private info' : 'Unlock private info'}</span>
            </button>
          </div>
        )}
      </header>

      {/* CATEGORY NAV */}
      <nav className="app-nav shrink-0 z-30 pt-7 pb-4 landscape:pt-6 landscape:pb-2 overflow-x-auto whitespace-nowrap px-6 no-scrollbar flex items-center gap-2">
        <button
          onClick={() => {
            triggerHaptic(50);
            setActiveCategory(SystemCategories.EMERGENCY);
          }}
          className={`nav-primary-button nav-emergency-button ${
            activeCategory === SystemCategories.EMERGENCY
              ? 'is-active'
              : ''
          }`}
          aria-label="Emergency"
          aria-pressed={activeCategory === SystemCategories.EMERGENCY}
        >
          <MedicalIcon size={34} />
        </button>

        <button
          onClick={() => {
            triggerHaptic();
            setActiveCategory('All');
            setIsVaultUnlocked(false);
          }}
          className={`nav-primary-button nav-all-button ${activeCategory === 'All' ? 'is-active' : ''}`}
          style={{ '--nav-button-color': accentColor } as React.CSSProperties}
          aria-pressed={activeCategory === 'All'}
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
            className={`nav-category-button ${activeCategory === cat ? 'is-active' : ''}`}
            style={
              activeCategory === cat
                ? { backgroundColor: accentColor, borderColor: accentColor }
                : {}
            }
            aria-pressed={activeCategory === cat}
          >
            {cat}
          </button>
        ))}

        <button
          onClick={() => {
            triggerHaptic(15);
            setShowCatModal(true);
          }}
          className="nav-modify-button"
        >
          Modify
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main className="app-card-scroll flex-1 min-h-0 overflow-y-auto px-6 pt-8 pb-40 landscape:pt-6 landscape:pb-24">
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
              className="w-full max-w-sm h-16 landscape:h-12 bg-white text-black rounded-lg font-black text-lg landscape:text-sm active:scale-95 transition-transform"
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
                <div
                  key={card.id}
                  role="listitem"
                  className="swipe-card relative rounded-lg overflow-hidden"
                >
                  <div className="swipe-actions absolute inset-0 hidden justify-end bg-yellow-400">
                    <button
                      onClick={e => startEditing(card, e)}
                      className="w-21 shrink-0 bg-yellow-400 text-black flex items-center justify-center"
                      aria-label="Edit"
                    >
                      <EditIcon size={28} />
                    </button>
                    <button
                      onClick={e => deleteCard(card.id, e)}
                      className="w-21 shrink-0 bg-red-600 text-white flex items-center justify-center"
                      aria-label="Delete"
                    >
                      <TrashIcon size={28} />
                    </button>
                  </div>
                  <article
                    onTouchStart={event => handleSwipeStart(event, card.id)}
                    onTouchEnd={event => handleSwipeEnd(event, card.id)}
                    onClick={() => {
                      if (didSwipe.current) {
                        didSwipe.current = false;
                        return;
                      }
                      if (openSwipeCardId === card.id) {
                        setOpenSwipeCardId(null);
                        return;
                      }
                      triggerHaptic(15);
                      setSelectedCard(card);
                    }}
                    className="swipe-card-content app-card group relative px-6 py-3 rounded-lg cursor-pointer transition-transform flex items-center gap-4 overflow-hidden"
                    data-open={openSwipeCardId === card.id}
                    style={
                      { '--accent-color': accentColor } as React.CSSProperties
                    }
                  >
                    <div className="card-copy flex-1 min-w-0">
                      <h3 className="text-2xl font-bold truncate group-hover:text-(--accent-color) transition-colors">
                        {card.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className="card-category font-bold"
                          style={
                            card.category === SystemCategories.EMERGENCY
                              ? { color: emergencyColor }
                              : undefined
                          }
                        >
                          {card.category}
                        </span>
                      </div>
                    </div>

                    <div className="desktop-card-actions absolute right-2 flex items-center gap-0.5">
                      <button
                        onClick={e => startEditing(card, e)}
                        className="h-15 w-15 flex items-center justify-center text-zinc-700 hover:text-white active:scale-110 transition-all"
                        aria-label="Edit"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={e => deleteCard(card.id, e)}
                        className="h-15 w-15 flex items-center justify-center text-zinc-700 hover:text-red-500 active:scale-110 transition-all"
                        aria-label="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* BOTTOM BAR */}
      <div className="app-toolbar fixed bottom-0 left-0 right-0 z-20 px-8 pb-8 pt-4 flex items-center justify-center">
        <button
          onClick={() => {
            triggerHaptic(10);
            setEditingCard(null);
            setShowEditorModal(true);
          }}
          className="w-15 h-15 rounded-lg text-black flex items-center justify-center active:scale-95 transition-all shadow-lg border-0"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 8px 24px ${accentColor}50`,
          }}
          aria-label="New Card"
        >
          <PlusIcon size={34} strokeWidth={4} />
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
          onSetPasscode={passcode => handleUpdatePrefs({ ...prefs, passcode })}
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