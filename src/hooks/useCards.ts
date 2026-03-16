import { useState, useCallback } from 'react';
import { NoteCard } from '../types';
import { storageUtils } from '../utils/storage';

function generateId(): string {
  return `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const CARD_COLORS = [
  'bg-yellow-400 text-black',
  'bg-blue-500 text-white',
  'bg-green-500 text-white',
  'bg-purple-500 text-white',
  'bg-red-500 text-white',
  'bg-orange-400 text-black',
  'bg-cyan-400 text-black',
  'bg-pink-500 text-white',
];

export function useCards() {
  const [cards, setCards] = useState<NoteCard[]>(() => storageUtils.getCards());

  const saveAndUpdate = useCallback((newCards: NoteCard[]) => {
    setCards(newCards);
    storageUtils.saveCards(newCards);
  }, []);

  const addCard = useCallback((title: string, content: string, category: string = 'General', fontSize: NoteCard['fontSize'] = 'large') => {
    const now = new Date().toISOString();
    const colorIndex = Math.floor(Math.random() * CARD_COLORS.length);
    const newCard: NoteCard = {
      id: generateId(),
      title,
      content,
      category,
      color: CARD_COLORS[colorIndex],
      fontSize,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
    };
    const newCards = [newCard, ...cards];
    saveAndUpdate(newCards);
    return newCard;
  }, [cards, saveAndUpdate]);

  const updateCard = useCallback((id: string, updates: Partial<NoteCard>) => {
    const newCards = cards.map(card =>
      card.id === id ? { ...card, ...updates, updatedAt: new Date().toISOString() } : card
    );
    saveAndUpdate(newCards);
  }, [cards, saveAndUpdate]);

  const deleteCard = useCallback((id: string) => {
    const newCards = cards.filter(card => card.id !== id);
    saveAndUpdate(newCards);
  }, [cards, saveAndUpdate]);

  const togglePin = useCallback((id: string) => {
    const newCards = cards.map(card =>
      card.id === id ? { ...card, isPinned: !card.isPinned } : card
    );
    saveAndUpdate(newCards);
  }, [cards, saveAndUpdate]);

  const sortedCards = [...cards].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return { cards: sortedCards, addCard, updateCard, deleteCard, togglePin };
}
