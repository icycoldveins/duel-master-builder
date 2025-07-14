import { useState } from 'react';
import { useDeckStore } from '@/store/deckStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Download, Save, FolderOpen, Plus, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { saveDeck as saveDeckToSupabase, getDecks as getDecksFromSupabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function DeckActions() {
  const [newDeckName, setNewDeckName] = useState('');
  const [showSavedDecks, setShowSavedDecks] = useState(false);
  const currentDeck = useDeckStore(state => state.currentDeck);
  const savedDecks = useDeckStore(state => state.savedDecks);
  const saveDeck = useDeckStore(state => state.saveDeck);
  const loadDeck = useDeckStore(state => state.loadDeck);
  const deleteDeck = useDeckStore(state => state.deleteDeck);
  const createNewDeck = useDeckStore(state => state.createNewDeck);
  const exportDeck = useDeckStore(state => state.exportDeck);
  const getDeckStats = useDeckStore(state => state.getDeckStats);
  const isDeckDirty = useDeckStore(state => state.isDeckDirty);
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Save deck to Supabase
  const handleSaveDeck = async () => {
    if (!user) return;
    try {
      await saveDeckToSupabase(currentDeck, user.id);
      toast({
        title: "Deck saved",
        description: `"${currentDeck.name}" has been saved to your account`,
      });
    } catch (e) {
      toast({
        title: "Save failed",
        description: "Could not save deck to Supabase.",
        variant: "destructive"
      });
    }
  };

  // Load decks from Supabase
  const handleLoadDecks = async () => {
    if (!user) return;
    try {
      const decks = await getDecksFromSupabase(user.id);
      // You may want to update Zustand store here
      // setSavedDecks(decks)
      toast({
        title: "Decks loaded",
        description: `Loaded ${decks.length} decks from your account`,
      });
    } catch (e) {
      toast({
        title: "Load failed",
        description: "Could not load decks from Supabase.",
        variant: "destructive"
      });
    }
  };

  const handleNewDeck = () => {
    if (newDeckName.trim()) {
      createNewDeck(newDeckName.trim());
      setNewDeckName('');
      toast({
        title: "New deck created",
        description: `Started building "${newDeckName.trim()}"`,
      });
    }
  };

  const handleLoadDeck = (deckId: string) => {
    if (isDeckDirty()) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to load another deck and lose your changes?');
      if (!confirm) return;
    }
    const deck = savedDecks.find(d => d.id === deckId);
    loadDeck(deckId);
    setShowSavedDecks(false);
    toast({
      title: "Deck loaded",
      description: `"${deck?.name}" is now active`,
    });
  };

  const handleDeleteDeck = (deckId: string) => {
    if (isDeckDirty() && currentDeck.id === deckId) {
      const confirm = window.confirm('You have unsaved changes in this deck. Are you sure you want to delete it and lose your changes?');
      if (!confirm) return;
    }
    const deck = savedDecks.find(d => d.id === deckId);
    deleteDeck(deckId);
    toast({
      title: "Deck deleted",
      description: `"${deck?.name}" has been removed`,
      variant: "destructive"
    });
  };

  const handleExportDeck = () => {
    const deckText = exportDeck();
    const blob = new Blob([deckText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentDeck.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Deck exported",
      description: "Deck list saved as .txt file",
    });
  };

  const handleCopyDeckList = async () => {
    try {
      await navigator.clipboard.writeText(exportDeck());
      toast({
        title: "Copied to clipboard",
        description: "Deck list copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const stats = getDeckStats();

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={handleSaveDeck} 
            className="w-full bg-gradient-primary hover:shadow-glow"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Deck
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportDeck}
              disabled={stats.total === 0}
              className="border-border/50 hover:border-primary/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleCopyDeckList}
              disabled={stats.total === 0}
              className="border-border/50 hover:border-primary/50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>

          <Dialog open={showSavedDecks} onOpenChange={setShowSavedDecks}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-border/50 hover:border-primary/50">
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Deck ({savedDecks.length})
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Saved Decks</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {savedDecks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No saved decks yet. Save your current deck to get started!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedDecks.map((deck) => {
                      const deckStats = {
                        main: deck.mainDeck.reduce((sum, card) => sum + card.count, 0),
                        extra: deck.extraDeck.reduce((sum, card) => sum + card.count, 0),
                        side: deck.sideDeck.reduce((sum, card) => sum + card.count, 0)
                      };
                      
                      return (
                        <div 
                          key={deck.id} 
                          className="flex items-center justify-between p-4 bg-gradient-card rounded-lg border border-border"
                        >
                          <div className="space-y-1">
                            <h3 className="font-medium text-foreground">{deck.name}</h3>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                Main: {deckStats.main}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Extra: {deckStats.extra}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Side: {deckStats.side}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Updated: {new Date(deck.updatedAt).toLocaleDateString()}
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleLoadDeck(deck.id)}
                              className="bg-gradient-primary hover:shadow-glow"
                            >
                              Load
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteDeck(deck.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* New Deck */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">New Deck</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            placeholder="Enter deck name..."
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNewDeck()}
            className="bg-input/50 border-border/50 focus:bg-input focus:border-primary/50"
          />
          <Button 
            onClick={handleNewDeck}
            disabled={!newDeckName.trim()}
            className="w-full bg-gradient-secondary hover:shadow-secondary-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Deck
          </Button>
        </CardContent>
      </Card>

      {/* Current Deck Info */}
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg text-foreground">Current Deck</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <div className="font-medium text-foreground">{currentDeck.name}</div>
            <div>Total: {stats.total} cards</div>
            <div>Created: {new Date(currentDeck.createdAt).toLocaleDateString()}</div>
            <div>Updated: {new Date(currentDeck.updatedAt).toLocaleDateString()}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}