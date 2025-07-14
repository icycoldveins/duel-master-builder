import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { YugiohCard } from '@/lib/api';

export interface DeckCard {
  card: YugiohCard;
  count: number;
}

export interface Deck {
  name: string;
  mainDeck: DeckCard[];
  extraDeck: DeckCard[];
  sideDeck: DeckCard[];
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DeckState {
  currentDeck: Deck;
  savedDecks: Deck[];
  
  // Deck manipulation
  addCardToDeck: (card: YugiohCard, section: 'main' | 'extra' | 'side') => void;
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
}

const createEmptyDeck = (name = 'New Deck'): Deck => ({
  name,
  mainDeck: [],
  extraDeck: [],
  sideDeck: [],
  id: Date.now().toString(),
  createdAt: new Date(),
  updatedAt: new Date()
});

const isExtraDeckCard = (card: YugiohCard): boolean => {
  const extraDeckTypes = ['Fusion Monster', 'Synchro Monster', 'XYZ Monster', 'Link Monster'];
  return extraDeckTypes.includes(card.type);
};

export const useDeckStore = create<DeckState>()(
  persist(
    (set, get) => ({
      currentDeck: createEmptyDeck(),
      savedDecks: [],

      addCardToDeck: (card, section) => {
        const state = get();
        const currentDeck = { ...state.currentDeck };
        
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
            currentDeck[deckSection][existingCardIndex].count += 1;
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
        const currentDeck = { ...state.currentDeck };
        const deckSection = section === 'main' ? 'mainDeck' : 
                           section === 'extra' ? 'extraDeck' : 'sideDeck';
        
        const existingCardIndex = currentDeck[deckSection].findIndex(
          deckCard => deckCard.card.id === cardId
        );
        
        if (existingCardIndex >= 0) {
          if (currentDeck[deckSection][existingCardIndex].count > 1) {
            currentDeck[deckSection][existingCardIndex].count -= 1;
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
        const currentDeck = { ...state.currentDeck };
        const deckSection = section === 'main' ? 'mainDeck' : 
                           section === 'extra' ? 'extraDeck' : 'sideDeck';
        
        const existingCardIndex = currentDeck[deckSection].findIndex(
          deckCard => deckCard.card.id === cardId
        );
        
        if (existingCardIndex >= 0) {
          if (count === 0) {
            currentDeck[deckSection].splice(existingCardIndex, 1);
          } else {
            currentDeck[deckSection][existingCardIndex].count = count;
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
        
        set({ savedDecks });
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
        set({ savedDecks });
      },

      updateDeckName: (name) => {
        const state = get();
        const currentDeck = { ...state.currentDeck, name, updatedAt: new Date() };
        set({ currentDeck });
      },

      getDeckStats: () => {
        const state = get();
        const mainCount = state.currentDeck.mainDeck.reduce((sum, card) => sum + card.count, 0);
        const extraCount = state.currentDeck.extraDeck.reduce((sum, card) => sum + card.count, 0);
        const sideCount = state.currentDeck.sideDeck.reduce((sum, card) => sum + card.count, 0);
        
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
      }
    }),
    {
      name: 'yugioh-deck-storage',
      partialize: (state) => ({ 
        savedDecks: state.savedDecks,
        currentDeck: state.currentDeck 
      })
    }
  )
);