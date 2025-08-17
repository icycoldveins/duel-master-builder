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
import { LoginModal } from './LoginModal';

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
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Reserved words (add more as needed)
  const reserved = ['admin', 'root', 'support', 'null', 'undefined', 'user', 'test', 'me', 'profile', 'api'];

  useEffect(() => {
    if (!loading && user && !user.user_metadata?.username) {
      setShowUsernameDialog(true);
    } else {
      setShowUsernameDialog(false);
    }
  }, [user, loading]);

  // Remove the redirect to auth - allow unauthenticated access

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
      if (supabase) {
        const { error: metaError } = await supabase.auth.updateUser({ data: { username } });
        if (metaError) throw metaError;
      }
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
    if (supabase) {
      await supabase.auth.signOut();
    }
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
              Usernames are unique and required to save and load decks.
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
      
      {/* Login Modal */}
      <LoginModal
        open={showLoginModal}
        onOpenChange={setShowLoginModal}
        onSuccess={() => {
          // After successful login, reload user decks
          if (user) {
            loadUserDecks(user.id);
          }
        }}
      />
      
      <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
        {/* Enhanced background with mesh gradient */}
        <div className="absolute inset-0 bg-gradient-mesh opacity-40"></div>
        
        {/* Animated floating orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full mix-blend-screen filter blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full mix-blend-screen filter blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full mix-blend-screen filter blur-3xl animate-float-delayed"></div>
        </div>
        
        {/* Animated gradient lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent animate-pulse animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto p-4 relative z-10">
          {/* User Info Top Right */}
          <div className="flex justify-end items-center mb-4 animate-fade-in">
            {!loading && user ? (
              <div className="glass px-5 py-3 rounded-2xl flex items-center gap-4 relative">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                    {user.user_metadata?.username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="font-medium text-foreground">
                    {user.user_metadata?.username || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="relative z-10 px-4 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : !loading && (
              <div className="glass px-5 py-3 rounded-2xl flex items-center gap-4 relative">
                <span className="text-muted-foreground text-sm">
                  Guest Mode - Login to save decks
                </span>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="relative z-10 px-4 py-1.5 rounded-lg bg-gradient-primary text-white hover:shadow-glow transition-all duration-300 text-sm font-medium"
                >
                  Login
                </button>
              </div>
            )}
          </div>
          {/* Enhanced Header */}
          <div className="text-center space-y-6 py-12 animate-fade-in">
            <div className="relative inline-block">
              <img src="/millennium-puzzle.png" alt="Millennium Puzzle Logo" style={{ display: 'inline-block', width: 100, height: 100 }} className="mx-auto mb-6 logo-glow animate-glow-pulse" />
              <div className="absolute inset-0 blur-3xl bg-yellow-500/20 rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-6xl lg:text-7xl font-bold tracking-tight relative">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient bg-300%">
                Yu-Gi-Oh!
              </span>
              <span className="block text-4xl lg:text-5xl mt-2 text-gradient-secondary">
                Deck Builder
              </span>
            </h1>
            <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
              Build competitive decks with the latest card database and real-time validation
            </p>
            <div className="flex justify-center gap-2 mt-4">
              <div className="h-1 w-20 bg-gradient-primary rounded-full animate-pulse"></div>
              <div className="h-1 w-20 bg-gradient-accent rounded-full animate-pulse animation-delay-2000"></div>
              <div className="h-1 w-20 bg-gradient-secondary rounded-full animate-pulse animation-delay-4000"></div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Left: Deck Preview, Stats, Actions */}
            <div className="xl:col-span-3 flex flex-col gap-6">
              <div className="glass-dark rounded-3xl p-6 shadow-2xl flex flex-col gap-6 animate-slide-in sticky top-4 border border-white/10 hover:border-primary/30 transition-all duration-500">
                <div className="absolute -inset-px bg-gradient-primary rounded-3xl opacity-0 hover:opacity-10 transition-opacity duration-500"></div>
                <DeckPreview deck={currentDeck} />
                <DeckStats />
                <DeckActions />
              </div>
            </div>

            {/* Center: Deck Sections */}
            <div className="xl:col-span-6 flex flex-col gap-8">
              <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <DeckSection 
                  title="Main Deck" 
                  section="main" 
                  cards={currentDeck.mainDeck}
                  limit={60}
                  minCards={40}
                  description="The main deck contains 40-60 cards used during the duel"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <DeckSection 
                  title="Extra Deck" 
                  section="extra" 
                  cards={currentDeck.extraDeck}
                  limit={15}
                  description="Fusion, Synchro, XYZ, and Link monsters (max 15 cards)"
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <DeckSection 
                  title="Side Deck" 
                  section="side" 
                  cards={currentDeck.sideDeck}
                  limit={15}
                  description="Cards that can be swapped between duels (max 15 cards)"
                />
              </div>
            </div>

            {/* Right: Card Search Sidebar */}
            <div className="xl:col-span-3">
              <div className="glass-dark rounded-3xl p-6 shadow-2xl sticky top-4 animate-slide-in border border-white/10 hover:border-accent/30 transition-all duration-500" style={{ animationDelay: '0.4s' }}>
                <div className="absolute -inset-px bg-gradient-accent rounded-3xl opacity-0 hover:opacity-10 transition-opacity duration-500"></div>
                <CardSearch />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CardDialogProvider>
  );
}