import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Deck API
export async function saveDeck(deck, userId) {
  const { data, error } = await supabase
    .from('decks')
    .upsert([{ ...deck, user_id: userId }]);
  if (error) throw error;
  return data;
}

export async function getDecks(userId) {
  const { data, error } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
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