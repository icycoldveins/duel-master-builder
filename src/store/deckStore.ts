import { create } from "zustand";
import { YugiohCard } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";
import { saveDeck, getDecks } from "@/lib/supabase";

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
  user_id?: string;
}

interface DeckState<T = YugiohCard> {
  currentDeck: Deck<T>;
  savedDecks: Deck<T>[];
  lastSavedDeck?: Deck<T>;

  // Deck manipulation
  addCardToDeck: (card: T, section: "main" | "extra" | "side") => void;
  removeCardFromDeck: (
    cardId: number,
    section: "main" | "extra" | "side",
  ) => void;
  updateCardCount: (
    cardId: number,
    section: "main" | "extra" | "side",
    count: number,
  ) => void;

  // Deck management
  createNewDeck: (name?: string) => void;
  saveCurrentDeckToSupabase: (userId: string) => Promise<void>;
  loadUserDecks: (userId: string) => Promise<void>;
  deleteDeckFromSupabase: (deckId: string, userId: string) => Promise<void>;
  resetStore: () => void;
  updateDeckName: (name: string) => void;

  // Utilities
  getDeckStats: () => {
    mainCount: number;
    extraCount: number;
    sideCount: number;
    total: number;
  };
  canAddCard: (section: "main" | "extra" | "side") => boolean;
  exportDeck: () => string;
  isDeckDirty: () => boolean;
}

const createEmptyDeck = <T = YugiohCard>(name = "New Deck"): Deck<T> => ({
  name,
  mainDeck: [],
  extraDeck: [],
  sideDeck: [],
  id: uuidv4(),
  createdAt: new Date(),
  updatedAt: new Date(),
});

const isExtraDeckCard = (card: any): boolean => {
  const extraDeckTypes = [
    "Fusion Monster",
    "Synchro Monster",
    "XYZ Monster",
    "Link Monster",
  ];
  return extraDeckTypes.includes(card.type);
};

export const useDeckStore = create<DeckState>()((set, get) => ({
  currentDeck: createEmptyDeck(),
  savedDecks: [],
  lastSavedDeck: undefined,

  addCardToDeck: (card, section) => {
    const state = get();
    const currentDeck = {
      ...state.currentDeck,
      mainDeck: [...state.currentDeck.mainDeck],
      extraDeck: [...state.currentDeck.extraDeck],
      sideDeck: [...state.currentDeck.sideDeck],
    };
    if (isExtraDeckCard(card) && section === "main") {
      section = "extra";
    }
    const deckSection =
      section === "main"
        ? "mainDeck"
        : section === "extra"
          ? "extraDeck"
          : "sideDeck";
    if (!state.canAddCard(section)) return;
    const existingCardIndex = currentDeck[deckSection].findIndex(
      (deckCard) => deckCard.card.id === card.id,
    );
    if (existingCardIndex >= 0) {
      if (currentDeck[deckSection][existingCardIndex].count < 3) {
        currentDeck[deckSection][existingCardIndex] = {
          ...currentDeck[deckSection][existingCardIndex],
          count: currentDeck[deckSection][existingCardIndex].count + 1,
        };
      }
    } else {
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
    const deckSection =
      section === "main"
        ? "mainDeck"
        : section === "extra"
          ? "extraDeck"
          : "sideDeck";
    const existingCardIndex = currentDeck[deckSection].findIndex(
      (deckCard) => deckCard.card.id === cardId,
    );
    if (existingCardIndex >= 0) {
      if (currentDeck[deckSection][existingCardIndex].count > 1) {
        currentDeck[deckSection][existingCardIndex] = {
          ...currentDeck[deckSection][existingCardIndex],
          count: currentDeck[deckSection][existingCardIndex].count - 1,
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
    const deckSection =
      section === "main"
        ? "mainDeck"
        : section === "extra"
          ? "extraDeck"
          : "sideDeck";
    const existingCardIndex = currentDeck[deckSection].findIndex(
      (deckCard) => deckCard.card.id === cardId,
    );
    if (existingCardIndex >= 0) {
      if (count === 0) {
        currentDeck[deckSection].splice(existingCardIndex, 1);
      } else {
        currentDeck[deckSection][existingCardIndex] = {
          ...currentDeck[deckSection][existingCardIndex],
          count,
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

  saveCurrentDeckToSupabase: async (userId) => {
    const state = get();
    const deck = { ...state.currentDeck, user_id: userId };
    await saveDeck(deck, userId);
    // Reload decks after save
    const decks = await getDecks(userId);
    set({ savedDecks: decks, lastSavedDeck: { ...state.currentDeck } });
  },

  loadUserDecks: async (userId) => {
    const decks = await getDecks(userId);
    set({ savedDecks: decks });
  },

  deleteDeckFromSupabase: async (deckId, userId) => {
    await import("@/lib/supabase").then(({ supabase }) =>
      supabase.from("decks").delete().eq("id", deckId).eq("user_id", userId),
    );
    // Reload decks after delete
    const decks = await getDecks(userId);
    set({ savedDecks: decks });
  },

  resetStore: () => {
    set({
      currentDeck: createEmptyDeck(),
      savedDecks: [],
      lastSavedDeck: undefined,
    });
  },

  updateDeckName: (name) => {
    const state = get();
    const currentDeck = { ...state.currentDeck, name, updatedAt: new Date() };
    set({ currentDeck });
  },

  getDeckStats: () => {
    const state = get();
    const { currentDeck } = state;
    const mainCount = currentDeck.mainDeck.reduce(
      (sum, card) => sum + card.count,
      0,
    );
    const extraCount = currentDeck.extraDeck.reduce(
      (sum, card) => sum + card.count,
      0,
    );
    const sideCount = currentDeck.sideDeck.reduce(
      (sum, card) => sum + card.count,
      0,
    );
    return {
      mainCount,
      extraCount,
      sideCount,
      total: mainCount + extraCount + sideCount,
    };
  },

  canAddCard: (section) => {
    const stats = get().getDeckStats();
    switch (section) {
      case "main":
        return stats.mainCount < 60;
      case "extra":
        return stats.extraCount < 15;
      case "side":
        return stats.sideCount < 15;
      default:
        return false;
    }
  },

  exportDeck: () => {
    const state = get();
    const { currentDeck } = state;
    let deckText = `# ${currentDeck.name}\n\n`;
    deckText += "# Main Deck\n";
    currentDeck.mainDeck.forEach((deckCard) => {
      deckText += `${deckCard.count}x ${deckCard.card.name}\n`;
    });
    if (currentDeck.extraDeck.length > 0) {
      deckText += "\n# Extra Deck\n";
      currentDeck.extraDeck.forEach((deckCard) => {
        deckText += `${deckCard.count}x ${deckCard.card.name}\n`;
      });
    }
    if (currentDeck.sideDeck.length > 0) {
      deckText += "\n# Side Deck\n";
      currentDeck.sideDeck.forEach((deckCard) => {
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
  },
}));
