import React, { useState, useEffect, useRef } from 'react';
import { VisioCard, Category, UserPreferences, SystemCategories } from './types';
import { storage, DEFAULT_VAULT_CARDS } from './lib/storage';
import { generateRecoveryKey, hashRecoveryKey, normalizeRecoveryKey } from './lib/recovery';
import { createPasscodeRecord, verifyPasscode } from './lib/passcode';
import { newVaultKey, wrapVaultKey, unwrapVaultKey, sealVault, openVault } from './lib/vault';
import { Settings, FileKey, LogOut, Menu, X } from 'lucide-react';
import {
  TrashIcon,
  PlusIcon,
  EditIcon,
  MedicalIcon,
  PenIcon,
  ShowCardIcon,
} from './components/Icons';
import FullscreenViewer from './components/FullscreenViewer';
import CardEditorModal from './components/CardEditorModal';
import QuickWriteModal from './components/QuickWriteModal';
import CategoryManagerModal from './components/CategoryManagerModal';
import PasscodeModal, { clearPasscodeAttempts } from './components/PasscodeModal';
import { RecoveryKeyModal, RecoveryEntryModal } from './components/RecoveryModals';
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
  const [showQuickWrite, setShowQuickWrite] = useState(false);
  // Text from Quick write that is being saved as a card. Not stored until the card is saved.
  const [quickDraft, setQuickDraft] = useState<string | null>(null);
  // The last deleted card, kept for a few seconds so it can be put back.
  const [undoItem, setUndoItem] = useState<{ card: VisioCard; index: number } | null>(null);
  const undoTimer = useRef<number | null>(null);
  const [showRecoveryEntry, setShowRecoveryEntry] = useState(false);
  const [pendingRecoveryKey, setPendingRecoveryKey] = useState<string | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openSwipeCardId, setOpenSwipeCardId] = useState<string | null>(null);
  const swipeStartX = useRef(0);
  const didSwipe = useRef(false);
  // The vault key exists in memory only while the Vault is unlocked.
  const vaultKeyRef = useRef<CryptoKey | null>(null);
  const legacyVaultRef = useRef<VisioCard[]>([]);
  const vaultExists = !!prefs.vaultWrapCode || !!prefs.vaultWrapRecovery;
  // The logout button is accent when a Secret Code exists, and light gray when none is set.
  const hasSecretCode = !!prefs.passcodeHash || vaultExists;

  const isVaultCard = (c: VisioCard) => c.category === SystemCategories.VAULT;

  // Writes the normal cards in plain text and the Vault cards as one encrypted blob.
  const persistCards = async (next: VisioCard[]) => {
    const key = vaultKeyRef.current;
    if (!key) {
      // Locked: keep old plain-text Vault cards until they are moved into the encrypted Vault.
      storage.saveCards([...next.filter(c => !isVaultCard(c)), ...legacyVaultRef.current]);
      return;
    }
    storage.saveCards(next.filter(c => !isVaultCard(c)));
    storage.saveVault(await sealVault(key, next.filter(isVaultCard)));
  };

  // Returns the vault key and cards for a verified Secret Code.
  // A Vault from an older build has no wrapped key yet, so its cards are migrated here.
  const openVaultWith = async (code: string) => {
    if (prefs.vaultWrapCode) {
      const key = await unwrapVaultKey(code, prefs.vaultWrapCode);
      if (!key) return null;
      const blob = storage.getVault();
      const cards = blob ? await openVault(key, blob) : [];
      return cards ? { key, cards, migrated: false } : null;
    }
    const key = await newVaultKey();
    const cards = legacyVaultRef.current.length > 0 ? legacyVaultRef.current : DEFAULT_VAULT_CARDS;
    return { key, cards, migrated: true };
  };

  useEffect(() => {
    const stored = storage.getCards();
    // Plain-text Vault cards from an older build. They move into the encrypted Vault on first unlock.
    legacyVaultRef.current = stored.filter(isVaultCard);
    setCards(stored.filter(c => !isVaultCard(c)));
    setCategories(storage.getCategories());
  }, []);

  // Moves a Secret Code saved in plain text by an older version to a salted hash.
  useEffect(() => {
    const legacyCode = storage.getLegacyPasscode();
    if (!legacyCode) return;
    createPasscodeRecord(legacyCode).then(record => {
      const next = { ...prefs, ...record };
      setPrefs(next);
      storage.savePrefs(next);
    });
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

  const handleSettingsSave = async (
    newPrefs: UserPreferences,
    change?: { newCode: string; currentCode?: string }
  ) => {
    if (change) {
      await handleNewCode(newPrefs, change.newCode, change.currentCode);
    } else {
      handleUpdatePrefs(newPrefs);
    }
  };

  // Sets a new Secret Code and makes a new recovery key. The Vault key is re-wrapped,
  // so the cards are not encrypted again. currentCode is needed when a Vault already exists.
  const handleNewCode = async (base: UserPreferences, newCode: string, currentCode?: string): Promise<boolean> => {
    let key = vaultKeyRef.current;
    let vaultCards = key ? cards.filter(isVaultCard) : [];
    if (!key) {
      if (currentCode !== undefined) {
        const opened = await openVaultWith(currentCode);
        if (!opened) return false;
        key = opened.key;
        vaultCards = opened.cards;
      } else {
        // A locked Vault cannot be re-keyed without its code or recovery key.
        if (vaultExists) return false;
        key = await newVaultKey();
        vaultCards = legacyVaultRef.current.length > 0 ? legacyVaultRef.current : DEFAULT_VAULT_CARDS;
      }
    }

    const recoveryKey = generateRecoveryKey();
    const next: UserPreferences = {
      ...base,
      ...(await createPasscodeRecord(newCode)),
      vaultWrapCode: await wrapVaultKey(key, newCode),
      vaultWrapRecovery: await wrapVaultKey(key, normalizeRecoveryKey(recoveryKey)),
      recoveryKeyHash: await hashRecoveryKey(recoveryKey),
    };

    vaultKeyRef.current = key;
    legacyVaultRef.current = [];
    const nextCards = [...cards.filter(c => !isVaultCard(c)), ...vaultCards];
    setCards(nextCards);
    setIsVaultUnlocked(true);
    setPrefs(next);
    storage.savePrefs(next);
    setPendingRecoveryKey(recoveryKey);
    await persistCards(nextCards);
    triggerHaptic(50);
    return true;
  };

  // Opens the Vault with the recovery key. The old Secret Code is removed, but the
  // recovery key stays valid until a new code is set, so the Vault can be reopened.
  const handleRecovered = async (recoveryKey: string): Promise<boolean> => {
    if (!prefs.vaultWrapRecovery) return false;
    const key = await unwrapVaultKey(recoveryKey, prefs.vaultWrapRecovery);
    if (!key) return false;
    const blob = storage.getVault();
    const vaultCards = blob ? await openVault(key, blob) : [];
    if (!vaultCards) return false;

    vaultKeyRef.current = key;
    legacyVaultRef.current = [];
    setCards(prev => [...prev.filter(c => !isVaultCard(c)), ...vaultCards]);
    const next = { ...prefs, passcodeHash: undefined, passcodeSalt: undefined, vaultWrapCode: undefined };
    setPrefs(next);
    storage.savePrefs(next);
    clearPasscodeAttempts();
    setIsVaultUnlocked(true);
    setShowRecoveryEntry(false);
    return true;
  };

  const handleSaveCard = (
    data: { title: string; content: string; category: Category },
    id?: string
  ) => {
    // Private cards can only be written while the Vault is unlocked.
    if (data.category === SystemCategories.VAULT && !vaultKeyRef.current) return;
    {
      const prevCards = cards;
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
      setCards(nextCards);
      persistCards(nextCards);
    }
    setShowEditorModal(false);
    setEditingCard(null);
    setQuickDraft(null);
    triggerHaptic(50);
  };

  const dismissUndo = () => {
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    undoTimer.current = null;
    setUndoItem(null);
  };

  const deleteCard = (id: string, e: React.SyntheticEvent) => {
    e.stopPropagation();
    triggerHaptic(100);
    setOpenSwipeCardId(null);
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) return;
    const card = cards[index];
    const next = cards.filter(c => c.id !== id);
    setCards(next);
    persistCards(next);
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
    setUndoItem({ card, index });
    undoTimer.current = window.setTimeout(dismissUndo, 5000);
  };

  const undoDelete = () => {
    if (!undoItem) return;
    const { card, index } = undoItem;
    dismissUndo();
    // A Vault card can only come back while the Vault is open.
    if (isVaultCard(card) && !vaultKeyRef.current) return;
    const next = [...cards];
    next.splice(Math.min(index, next.length), 0, card);
    setCards(next);
    persistCards(next);
  };

  useEffect(() => () => {
    if (undoTimer.current) window.clearTimeout(undoTimer.current);
  }, []);

  const openEditorFromQuick = (text: string) => {
    setSelectedCard(null);
    setEditingCard(null);
    setQuickDraft(text);
    setShowEditorModal(true);
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
    const remainingCats = categories.filter(c => c !== name);
    const reachableCats = remainingCats.filter(
      c =>
        ![SystemCategories.VAULT, SystemCategories.EMERGENCY].includes(
          c as any
        )
    );
    const fallback =
      reachableCats.length > 0 ? reachableCats[0] : SystemCategories.DAILY;
    const nextCards = cards.map(c =>
      c.category === name ? { ...c, category: fallback } : c
    );
    setCards(nextCards);
    persistCards(nextCards);
    setCategories(remainingCats);
    storage.saveCategories(remainingCats);
    if (activeCategory === name) setActiveCategory('All');
    triggerHaptic(80);
  };

  const handleReorderCategories = (newOrder: Category[]) => {
    setCategories(newOrder);
    storage.saveCategories(newOrder);
  };

  const handlePasscodeVerify = async (code: string) => {
    if (!(await verifyPasscode(code, prefs))) return false;
    const opened = await openVaultWith(code);
    if (!opened) return false;

    vaultKeyRef.current = opened.key;
    const nextCards = [...cards.filter(c => !isVaultCard(c)), ...opened.cards];
    setCards(nextCards);
    setIsVaultUnlocked(true);
    setShowPasscodeModal(false);
    if (opened.migrated) {
      // Save the wrapped key and the encrypted cards, and drop the old plain-text copies.
      legacyVaultRef.current = [];
      const next = { ...prefs, vaultWrapCode: await wrapVaultKey(opened.key, code) };
      setPrefs(next);
      storage.savePrefs(next);
      await persistCards(nextCards);
    }
    return true;
  };

  // Escape closes the top-most dialog that is safe to close.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showQuickWrite) setShowQuickWrite(false);
      else if (showRecoveryEntry) setShowRecoveryEntry(false);
      else if (showPasscodeModal) setShowPasscodeModal(false);
      else if (showCatModal) setShowCatModal(false);
      else if (selectedCard) setSelectedCard(null);
      else if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showQuickWrite, showRecoveryEntry, showPasscodeModal, showCatModal, selectedCard, isMobileMenuOpen]);

  // One tap locks the Vault and opens the Secret Code screen.
  const handleLockToggle = () => {
    triggerHaptic(20);
    if (isVaultUnlocked) {
      // Remove the decrypted Vault cards and the key from memory.
      vaultKeyRef.current = null;
      setCards(prev => prev.filter(c => !isVaultCard(c)));
      setIsVaultUnlocked(false);
    }
    setShowPasscodeModal(true);
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
      style={{ '--accent-color': accentColor } as React.CSSProperties}
    >
      <a href="#cards" className="skip-link">Skip to cards</a>

      {isMobileMenuOpen && (
        <div className="mobile-menu-tint md:hidden" onClick={() => setIsMobileMenuOpen(false)} aria-hidden="true" />
      )}

      {/* HEADER */}
      <header className="app-header relative shrink-0 z-40 px-4 sm:px-6 pt-6 landscape:pt-2 pb-2 landscape:pb-1 flex justify-between items-end gap-6 overflow-visible">
        <div>
          <h1 className="flex items-center gap-3 text-3xl sm:text-4xl landscape:text-2xl font-black leading-none mb-1">
            <ShowCardIcon size={32} className="text-(--accent-color)" />
            ShowCard
          </h1>
          <p className="brand-motto text-zinc-500">
            Your message, ready to show.
          </p>
        </div>
        <div className="flex items-center gap-2">
        <div className="hidden md:flex gap-2">
          <button
            onClick={() => {
              triggerHaptic(50);
              setActiveCategory(SystemCategories.EMERGENCY);
            }}
            aria-label="Emergency"
            aria-pressed={activeCategory === SystemCategories.EMERGENCY}
            className="header-utility rounded-lg flex items-center justify-center bg-zinc-900"
            style={{ color: '#E53935' }}
          >
            <MedicalIcon size={24} />
          </button>
          <button
            onClick={() => {
              triggerHaptic(15);
              setShowSettingsModal(true);
            }}
            aria-label="Settings"
            className="header-utility h-15 w-15 rounded-lg flex items-center justify-center bg-zinc-900 text-zinc-600 active:text-white transition-all"
          >
            <Settings size={24} strokeWidth={2.5} />
          </button>
        </div>
          <div className="hidden md:flex">
            <button
              onClick={handleLockToggle}
              aria-label={
                isVaultUnlocked ? 'Hide private' : 'Show private'
              }
              className={`header-utility logout-button h-15 w-15 rounded-lg flex items-center justify-center transition-all ${
                hasSecretCode
                  ? 'text-black shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                  : 'logout-button-idle'
              }`}
              style={hasSecretCode ? { backgroundColor: accentColor } : {}}
            >
              <LogOut size={20} strokeWidth={2.5} />
            </button>
        </div>
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
                triggerHaptic(50);
                setActiveCategory(SystemCategories.EMERGENCY);
                setIsMobileMenuOpen(false);
              }}
              className="mobile-header-menu-item"
              style={{ color: '#E53935' }}
            >
              <MedicalIcon size={24} />
              <span>Emergency</span>
            </button>
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
              <span>{isVaultUnlocked ? 'Hide private' : 'Show private'}</span>
            </button>
          </div>
        )}
      </header>

      {/* CATEGORY NAV */}
      <nav aria-label="Groups" className="app-nav shrink-0 z-30 pt-2 pb-2 landscape:pt-2 landscape:pb-1 overflow-x-auto whitespace-nowrap px-6 no-scrollbar flex items-center gap-2">
        <button
          onClick={() => {
            triggerHaptic(10);
            setEditingCard(null);
            setShowEditorModal(true);
          }}
          className="nav-add-button active:scale-95 transition-all shadow-lg"
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 8px 24px ${accentColor}50`,
          }}
          aria-label="New Card"
        >
          <PlusIcon size={26} strokeWidth={3} />
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
            {cat === SystemCategories.VAULT ? 'Private' : cat}
          </button>
        ))}

        <button
          onClick={() => {
            triggerHaptic(15);
            setShowCatModal(true);
          }}
          className="nav-modify-button"
        >
          Edit list
        </button>
      </nav>

      {/* MAIN CONTENT */}
      <main id="cards" tabIndex={-1} className="app-card-scroll flex-1 min-h-0 overflow-y-auto px-6 pt-4 pb-28 landscape:pt-3 landscape:pb-20">
        {activeCategory === SystemCategories.VAULT && !isVaultUnlocked ? (
          <div className="flex flex-col items-center justify-center py-20 landscape:py-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 landscape:w-16 landscape:h-16 bg-zinc-900 rounded-[40px] flex items-center justify-center mb-8 landscape:mb-4 text-zinc-600">
              <FileKey size={20} />
            </div>
            <h2 className="text-2xl landscape:text-lg font-black mb-3">
              Private is Locked
            </h2>
            <p className="text-zinc-500 mb-10 landscape:mb-6 max-w-xs leading-relaxed font-medium landscape:text-sm">
              Private info. Enter your code to see it.
            </p>
            <button
              onClick={() => {
                triggerHaptic(40);
                setShowPasscodeModal(true);
              }}
              className="w-full max-w-sm h-16 landscape:h-12 bg-white text-black rounded-lg font-black text-lg landscape:text-sm active:scale-95 transition-transform"
            >
              UNLOCK PRIVATE
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
                  <div className="swipe-actions absolute inset-0 hidden justify-end" style={{ backgroundColor: accentColor }}>
                    <button
                      onClick={e => startEditing(card, e)}
                      className="w-14 shrink-0 text-black flex items-center justify-center" style={{ backgroundColor: accentColor }}
                      aria-label="Edit"
                    >
                      <EditIcon size={28} />
                    </button>
                    <button
                      onClick={e => deleteCard(card.id, e)}
                      className="w-14 shrink-0 bg-red-600 text-white flex items-center justify-center"
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
                      <h2 className="text-2xl font-bold truncate group-hover:text-(--accent-color) transition-colors">
                        {card.title}
                      </h2>
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

                    <div className="desktop-card-actions absolute right-2 flex items-center">
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
      <div className="app-toolbar fixed bottom-0 left-0 right-0 z-20 px-8 pb-4 pt-2 flex items-center justify-center gap-3">
        <button
          onClick={() => {
            triggerHaptic(10);
            setShowQuickWrite(true);
          }}
          className="quick-write-float h-13 px-8 rounded-full font-black text-sm uppercase tracking-wide border-2 flex items-center gap-2 active:scale-95 transition-all"
          style={{
            borderColor: accentColor,
            backgroundColor: 'var(--theme-surface)',
            color: 'var(--theme-foreground)',
          }}
        >
          <PenIcon size={24} />
          Write a note
        </button>
      </div>

      {undoItem && (
        <div role="status" aria-live="polite" className="undo-toast">
          <span>Card deleted</span>
          <button type="button" onClick={undoDelete}>Undo</button>
        </div>
      )}

      {/* MODALS */}
      {showQuickWrite && (
        <QuickWriteModal
          accentColor={accentColor}
          onShow={text => {
            setShowQuickWrite(false);
            setSelectedCard({
              id: 'quick-write',
              title: 'Quick message',
              content: text,
              category: SystemCategories.DAILY,
              isSensitive: false,
              isLocked: false,
              createdAt: Date.now(),
            });
          }}
          onSaveAsCard={text => {
            setShowQuickWrite(false);
            openEditorFromQuick(text);
          }}
          onClose={() => setShowQuickWrite(false)}
        />
      )}
      {selectedCard && (
        <FullscreenViewer
          card={selectedCard}
          onClose={() => setSelectedCard(null)}
          onEdit={card => (card.id === 'quick-write' ? openEditorFromQuick(card.content) : startEditing(card))}
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
            setQuickDraft(null);
          }}
          onSave={data => handleSaveCard(data, editingCard?.id)}
          initialData={
            editingCard ||
            (quickDraft !== null
              ? { title: quickDraft.slice(0, 30), content: quickDraft, category: SystemCategories.DAILY }
              : undefined)
          }
          accentColor={accentColor}
          vaultUnlocked={isVaultUnlocked}
          vaultExists={!!prefs.passcodeHash || vaultExists}
          onRequestVault={() => setShowPasscodeModal(true)}
          onSetPasscode={passcode => handleNewCode(prefs, passcode)}
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
          onForgot={() => {
            setShowPasscodeModal(false);
            setShowRecoveryEntry(true);
          }}
        />
      )}
      {showRecoveryEntry && (
        <RecoveryEntryModal
          storedHash={prefs.recoveryKeyHash ?? ''}
          accentColor={accentColor}
          onRecovered={handleRecovered}
          onClose={() => setShowRecoveryEntry(false)}
        />
      )}
      {pendingRecoveryKey && (
        <RecoveryKeyModal
          recoveryKey={pendingRecoveryKey}
          accentColor={accentColor}
          onDone={() => setPendingRecoveryKey(null)}
        />
      )}
      {showSettingsModal && (
        <SettingsModal
          prefs={prefs}
          onSave={handleSettingsSave}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </div>
  );
};

export default App;