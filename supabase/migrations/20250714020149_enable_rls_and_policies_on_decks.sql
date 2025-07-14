-- Enable RLS
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- Policy for all actions
CREATE POLICY "Users can access their own decks"
  ON decks
  FOR ALL
  USING (user_id = auth.uid());
