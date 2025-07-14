import { useState } from 'react';
import { useDeckStore } from '@/store/deckStore';
import { DeckSection } from './DeckSection';
import { DeckStats } from './DeckStats';
import { DeckActions } from './DeckActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardSearch } from './CardSearch';
import { DeckPreview } from './DeckPreview';
import { CardDialogProvider } from './CardDialogProvider';

export function DeckBuilder() {
  const [activeTab, setActiveTab] = useState('search');
  const currentDeck = useDeckStore(state => state.currentDeck);
  const getDeckStats = useDeckStore(state => state.getDeckStats);
  const stats = getDeckStats();

  return (
    <CardDialogProvider>
      <div className="min-h-screen bg-gradient-dark">
        <div className="container mx-auto p-4">
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