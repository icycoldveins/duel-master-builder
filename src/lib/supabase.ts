import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper: map camelCase to snake_case for DB
function toDbDeck(deck, userId) {
  return {
    id: deck.id,
    user_id: userId,
    name: deck.name,
    main_deck: deck.mainDeck,
    extra_deck: deck.extraDeck,
    side_deck: deck.sideDeck,
    created_at: deck.createdAt instanceof Date ? deck.createdAt.toISOString() : deck.createdAt,
    updated_at: deck.updatedAt instanceof Date ? deck.updatedAt.toISOString() : deck.updatedAt,
  };
}
// Helper: map snake_case from DB to camelCase for app
function fromDbDeck(dbDeck) {
  return {
    id: dbDeck.id,
    user_id: dbDeck.user_id,
    name: dbDeck.name,
    mainDeck: dbDeck.main_deck,
    extraDeck: dbDeck.extra_deck,
    sideDeck: dbDeck.side_deck,
    createdAt: dbDeck.created_at,
    updatedAt: dbDeck.updated_at,
  };
}

export async function saveDeck(deck, userId) {
  const deckToSave = toDbDeck(deck, userId);
  const { data, error }: { data: any[] | null, error: any } = await supabase
    .from('decks')
    .upsert([deckToSave]);
  if (error) throw error;
  if (!data) return [];
  return data.map(fromDbDeck);
}

export async function getDecks(userId) {
  const { data, error }: { data: any[] | null, error: any } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  if (!data) return [];
  return data.map(fromDbDeck);
}

// Username/profile helpers
export async function isUsernameAvailable(username) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();
  if (error && error.code !== 'PGRST116') throw error; // PGRST116: No rows found
  return !data;
}

export async function upsertProfile(userId, username) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, username, updated_at: new Date().toISOString() }, { onConflict: 'id' });
  if (error) throw error;
  return data;
} 