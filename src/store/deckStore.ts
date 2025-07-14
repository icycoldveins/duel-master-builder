import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { YugiohCard } from '@/lib/api';
import { v4 as uuidv4 } from 'uuid';
import { useMemo } from 'react';

// Generic Card type for extensibility
export type GenericCard = Record<string, any>;

export interface DeckCard<T = YugiohCard> {
  card: T;
  count: number;
}

export interface Deck<T = YugiohCard> {
  name: string;
  mainDeck: DeckCard<T>[];
  extraDeck: DeckCard<T>[];
  sideDeck: DeckCard<T>[];
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DeckState<T = YugiohCard> {
  currentDeck: Deck<T>;
  savedDecks: Deck<T>[];
  lastSavedDeck?: Deck<T>;
  
  // Deck manipulation
  addCardToDeck: (card: T, section: 'main' | 'extra' | 'side') => void;
  removeCardFromDeck: (cardId: number, section: 'main' | 'extra' | 'side') => void;
  updateCardCount: (cardId: number, section: 'main' | 'extra' | 'side', count: number) => void;
  
  // Deck management
  createNewDeck: (name?: string) => void;
  saveDeck: () => void;
  loadDeck: (deckId: string) => void;
  deleteDeck: (deckId: string) => void;
  updateDeckName: (name: string) => void;
  
  // Utilities
  getDeckStats: () => {
    mainCount: number;
    extraCount: number;
    sideCount: number;
    total: number;
  };
  canAddCard: (section: 'main' | 'extra' | 'side') => boolean;
  exportDeck: () => string;
  isDeckDirty: () => boolean;
}

const createEmptyDeck = <T = YugiohCard>(name = 'New Deck'): Deck<T> => ({
  name,
  mainDeck: [],
  extraDeck: [],
  sideDeck: [],
  id: uuidv4(),
  createdAt: new Date(),
  updatedAt: new Date()
});

const isExtraDeckCard = (card: any): boolean => {
  const extraDeckTypes = ['Fusion Monster', 'Synchro Monster', 'XYZ Monster', 'Link Monster'];
  return extraDeckTypes.includes(card.type);
};

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      currentDeck: createEmptyDeck(),
      savedDecks: [],
      lastSavedDeck: undefined,

      addCardToDeck: (card, section) => {
        const state = get();
        // Deep clone deck sections for immutability
        const currentDeck = {
          ...state.currentDeck,
          mainDeck: [...state.currentDeck.mainDeck],
          extraDeck: [...state.currentDeck.extraDeck],
          sideDeck: [...state.currentDeck.sideDeck],
        };
        // Auto-route extra deck cards to extra deck
        if (isExtraDeckCard(card) && section === 'main') {
          section = 'extra';
        }
        const deckSection = section === 'main' ? 'mainDeck' : 
                           section === 'extra' ? 'extraDeck' : 'sideDeck';
        // Check limits
        if (!state.canAddCard(section)) return;
        const existingCardIndex = currentDeck[deckSection].findIndex(
          deckCard => deckCard.card.id === card.id
        );
        if (existingCardIndex >= 0) {
          // Card exists, increase count (max 3)
          if (currentDeck[deckSection][existingCardIndex].count < 3) {
            currentDeck[deckSection][existingCardIndex] = {
              ...currentDeck[deckSection][existingCardIndex],
              count: currentDeck[deckSection][existingCardIndex].count + 1
            };
          }
        } else {
          // New card, add to deck
          currentDeck[deckSection].push({ card, count: 1 });
        }
        currentDeck.updatedAt = new Date();
        set({ currentDeck });
      },

      removeCardFromDeck: (cardId, section) => {
        const state = get();
        const currentDeck = {
          ...state.currentDeck,
          mainDeck: [...state.currentDeck.mainDeck],
          extraDeck: [...state.currentDeck.extraDeck],
          sideDeck: [...state.currentDeck.sideDeck],
        };
        const deckSection = section === 'main' ? 'mainDeck' : 
                           section === 'extra' ? 'extraDeck' : 'sideDeck';
        const existingCardIndex = currentDeck[deckSection].findIndex(
          deckCard => deckCard.card.id === cardId
        );
        if (existingCardIndex >= 0) {
          if (currentDeck[deckSection][existingCardIndex].count > 1) {
            currentDeck[deckSection][existingCardIndex] = {
              ...currentDeck[deckSection][existingCardIndex],
              count: currentDeck[deckSection][existingCardIndex].count - 1
            };
          } else {
            currentDeck[deckSection].splice(existingCardIndex, 1);
          }
          currentDeck.updatedAt = new Date();
          set({ currentDeck });
        }
      },

      updateCardCount: (cardId, section, count) => {
        if (count < 0 || count > 3) return;
        const state = get();
        const currentDeck = {
          ...state.currentDeck,
          mainDeck: [...state.currentDeck.mainDeck],
          extraDeck: [...state.currentDeck.extraDeck],
          sideDeck: [...state.currentDeck.sideDeck],
        };
        const deckSection = section === 'main' ? 'mainDeck' : 
                           section === 'extra' ? 'extraDeck' : 'sideDeck';
        const existingCardIndex = currentDeck[deckSection].findIndex(
          deckCard => deckCard.card.id === cardId
        );
        if (existingCardIndex >= 0) {
          if (count === 0) {
            currentDeck[deckSection].splice(existingCardIndex, 1);
          } else {
            currentDeck[deckSection][existingCardIndex] = {
              ...currentDeck[deckSection][existingCardIndex],
              count
            };
          }
          currentDeck.updatedAt = new Date();
          set({ currentDeck });
        }
      },

      createNewDeck: (name) => {
        const newDeck = createEmptyDeck(name);
        set({ currentDeck: newDeck });
      },

      saveDeck: () => {
        const state = get();
        const savedDecks = [...state.savedDecks];
        const existingIndex = savedDecks.findIndex(deck => deck.id === state.currentDeck.id);
        if (existingIndex >= 0) {
          savedDecks[existingIndex] = { ...state.currentDeck, updatedAt: new Date() };
        } else {
          savedDecks.push({ ...state.currentDeck });
        }
        set({ savedDecks, lastSavedDeck: { ...state.currentDeck } });
      },

      loadDeck: (deckId) => {
        const state = get();
        const deck = state.savedDecks.find(d => d.id === deckId);
        if (deck) {
          set({ currentDeck: { ...deck } });
        }
      },

      deleteDeck: (deckId) => {
        const state = get();
        const savedDecks = state.savedDecks.filter(deck => deck.id !== deckId);
        let newCurrentDeck = state.currentDeck;
        let newLastSavedDeck = state.lastSavedDeck;
        if (state.currentDeck.id === deckId) {
          if (savedDecks.length > 0) {
            newCurrentDeck = { ...savedDecks[0] };
            newLastSavedDeck = { ...savedDecks[0] };
          } else {
            newCurrentDeck = createEmptyDeck();
            newLastSavedDeck = undefined;
          }
        }
        set({ savedDecks, currentDeck: newCurrentDeck, lastSavedDeck: newLastSavedDeck });
      },

      updateDeckName: (name) => {
        const state = get();
        const currentDeck = { ...state.currentDeck, name, updatedAt: new Date() };
        set({ currentDeck });
      },

      // Memoized getDeckStats using closure
      getDeckStats: () => {
        const state = get();
        // Memoize based on deck id and updatedAt
        const { currentDeck } = state;
        const mainCount = currentDeck.mainDeck.reduce((sum, card) => sum + card.count, 0);
        const extraCount = currentDeck.extraDeck.reduce((sum, card) => sum + card.count, 0);
        const sideCount = currentDeck.sideDeck.reduce((sum, card) => sum + card.count, 0);
        return {
          mainCount,
          extraCount,
          sideCount,
          total: mainCount + extraCount + sideCount
        };
      },

      canAddCard: (section) => {
        const stats = get().getDeckStats();
        switch (section) {
          case 'main':
            return stats.mainCount < 60;
          case 'extra':
            return stats.extraCount < 15;
          case 'side':
            return stats.sideCount < 15;
          default:
            return false;
        }
      },

      exportDeck: () => {
        const state = get();
        const { currentDeck } = state;
        let deckText = `# ${currentDeck.name}\n\n`;
        // Main Deck
        deckText += '# Main Deck\n';
        currentDeck.mainDeck.forEach(deckCard => {
          deckText += `${deckCard.count}x ${deckCard.card.name}\n`;
        });
        // Extra Deck
        if (currentDeck.extraDeck.length > 0) {
          deckText += '\n# Extra Deck\n';
          currentDeck.extraDeck.forEach(deckCard => {
            deckText += `${deckCard.count}x ${deckCard.card.name}\n`;
          });
        }
        // Side Deck
        if (currentDeck.sideDeck.length > 0) {
          deckText += '\n# Side Deck\n';
          currentDeck.sideDeck.forEach(deckCard => {
            deckText += `${deckCard.count}x ${deckCard.card.name}\n`;
          });
        }
        return deckText;
      },

      isDeckDirty: () => {
        const state = get();
        const a = state.currentDeck;
        const b = state.lastSavedDeck;
        if (!b) return true;
        return JSON.stringify(a) !== JSON.stringify(b);
      }
    }),
    {
      name: 'yugioh-deck-storage',
      partialize: (state) => ({ 
        savedDecks: state.savedDecks,
        currentDeck: state.currentDeck,
        lastSavedDeck: state.lastSavedDeck
      })
    }
  )
);