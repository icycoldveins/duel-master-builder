import { useState } from 'react';
import { useDeckStore } from '@/store/deckStore';
import { DeckSection } from './DeckSection';
import { DeckStats } from './DeckStats';
import { DeckActions } from './DeckActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardSearch } from './CardSearch';
import { DeckPreview } from './DeckPreview';
import { CardDialogProvider } from './CardDialogProvider';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { isUsernameAvailable, upsertProfile } from '@/lib/supabase';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function DeckBuilder() {
  const [activeTab, setActiveTab] = useState('search');
  const currentDeck = useDeckStore(state => state.currentDeck);
  const getDeckStats = useDeckStore(state => state.getDeckStats);
  const stats = getDeckStats();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const loadUserDecks = useDeckStore(state => state.loadUserDecks);

  // Username enforcement state
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checking, setChecking] = useState(false);
  const [showUsernameDialog, setShowUsernameDialog] = useState(false);

  // Reserved words (add more as needed)
  const reserved = ['admin', 'root', 'support', 'null', 'undefined', 'user', 'test', 'me', 'profile', 'api'];

  useEffect(() => {
    if (!loading && user && !user.user_metadata?.username) {
      setShowUsernameDialog(true);
    } else {
      setShowUsernameDialog(false);
    }
  }, [user, loading]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user) {
      loadUserDecks(user.id);
    }
  }, [user, loading, loadUserDecks]);

  const validateUsername = (name) => {
    if (!name) return 'Username is required.';
    if (name.length < 3 || name.length > 20) return 'Username must be 3-20 characters.';
    if (!/^[a-zA-Z0-9_]+$/.test(name)) return 'Only letters, numbers, and underscores allowed.';
    if (/^\d+$/.test(name)) return 'Username cannot be only numbers.';
    if (reserved.includes(name.toLowerCase())) return 'This username is not allowed.';
    return '';
  };

  const handleSetUsername = async (e) => {
    e.preventDefault();
    setUsernameError('');
    const error = validateUsername(username);
    if (error) {
      setUsernameError(error);
      return;
    }
    setChecking(true);
    try {
      const available = await isUsernameAvailable(username);
      if (!available) {
        setUsernameError('Username is already taken.');
        return;
      }
      // Update profiles table
      await upsertProfile(user.id, username);
      // Update user_metadata
      const { error: metaError } = await supabase.auth.updateUser({ data: { username } });
      if (metaError) throw metaError;
      toast({ title: 'Username set!', description: 'Your username has been saved.' });
      setShowUsernameDialog(false);
      window.location.reload(); // Force reload to update user context
    } catch (err) {
      setUsernameError('Error setting username. Try again.');
      toast({ title: 'Error', description: err.message || 'Could not set username.', variant: 'destructive' });
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    setUsernameError(validateUsername(e.target.value));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Optionally, you can redirect to /auth or let the app handle it via useAuth
  };

  return (
    <CardDialogProvider>
      {/* Username enforcement dialog */}
      <Dialog open={showUsernameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose a Username</DialogTitle>
            <DialogDescription>
              Usernames are unique and required. You cannot use the app until you set one.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSetUsername} className="space-y-4">
            <Input
              autoFocus
              value={username}
              onChange={handleUsernameChange}
              placeholder="Enter a unique username"
              disabled={checking}
              maxLength={20}
            />
            {usernameError && <div className="text-red-500 text-sm">{usernameError}</div>}
            <Button type="submit" disabled={checking || !!usernameError || !username} className="w-full">
              {checking ? 'Checking...' : 'Set Username'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <div className="min-h-screen bg-gradient-dark">
        <div className="container mx-auto p-4">
          {/* User Info Top Right */}
          <div className="flex justify-end items-center mb-2">
            {!loading && user && (
              <div className="flex items-center gap-3 bg-gradient-card border border-border rounded-xl px-4 py-2 shadow-card">
                <span className="font-medium text-foreground">
                  {user.user_metadata?.username || user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
          {/* Header */}
          <div className="text-center space-y-2 py-6">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Yu-Gi-Oh! Deck Builder
            </h1>
            <p className="text-muted-foreground">
              Build competitive decks with the latest card database
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Deck Preview, Stats, Actions */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="bg-gradient-card border border-border rounded-xl p-4 shadow-card flex flex-col gap-4">
                <DeckPreview deck={currentDeck} />
                <DeckStats />
                <DeckActions />
              </div>
            </div>

            {/* Center: Deck Sections */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              <DeckSection 
                title="Main Deck" 
                section="main" 
                cards={currentDeck.mainDeck}
                limit={60}
                minCards={40}
                description="The main deck contains 40-60 cards used during the duel"
              />
              <DeckSection 
                title="Extra Deck" 
                section="extra" 
                cards={currentDeck.extraDeck}
                limit={15}
                description="Fusion, Synchro, XYZ, and Link monsters (max 15 cards)"
              />
              <DeckSection 
                title="Side Deck" 
                section="side" 
                cards={currentDeck.sideDeck}
                limit={15}
                description="Cards that can be swapped between duels (max 15 cards)"
              />
            </div>

            {/* Right: Card Search Sidebar */}
            <div className="lg:col-span-3">
              <div className="bg-gradient-card border border-border rounded-xl p-4 shadow-card sticky top-8">
                <CardSearch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardDialogProvider>
  );
}