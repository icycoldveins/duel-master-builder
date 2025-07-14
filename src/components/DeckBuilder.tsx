import { useState } from 'react';
import { useDeckStore } from '@/store/deckStore';
import { DeckSection } from './DeckSection';
import { DeckStats } from './DeckStats';
import { DeckActions } from './DeckActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardSearch } from './CardSearch';

export function DeckBuilder() {
  const [activeTab, setActiveTab] = useState('search');
  const currentDeck = useDeckStore(state => state.currentDeck);
  const getDeckStats = useDeckStore(state => state.getDeckStats);
  const stats = getDeckStats();

  return (
    <div className="min-h-screen bg-gradient-dark">
      <div className="container mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-6">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Yu-Gi-Oh! Deck Builder
          </h1>
          <p className="text-muted-foreground">
            Build competitive decks with the latest card database
          </p>
        </div>

        {/* Deck Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <DeckStats />
          </div>
          <div className="lg:col-span-1">
            <DeckActions />
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-border">
            <TabsTrigger value="search" className="data-[state=active]:bg-gradient-primary">
              Card Search
            </TabsTrigger>
            <TabsTrigger value="main" className="data-[state=active]:bg-main-deck/20">
              Main Deck ({stats.mainCount})
            </TabsTrigger>
            <TabsTrigger value="extra" className="data-[state=active]:bg-extra-deck/20">
              Extra Deck ({stats.extraCount})
            </TabsTrigger>
            <TabsTrigger value="side" className="data-[state=active]:bg-side-deck/20">
              Side Deck ({stats.sideCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            <CardSearch />
          </TabsContent>

          <TabsContent value="main" className="space-y-6">
            <DeckSection 
              title="Main Deck" 
              section="main" 
              cards={currentDeck.mainDeck}
              limit={60}
              minCards={40}
              description="The main deck contains 40-60 cards used during the duel"
            />
          </TabsContent>

          <TabsContent value="extra" className="space-y-6">
            <DeckSection 
              title="Extra Deck" 
              section="extra" 
              cards={currentDeck.extraDeck}
              limit={15}
              description="Fusion, Synchro, XYZ, and Link monsters (max 15 cards)"
            />
          </TabsContent>

          <TabsContent value="side" className="space-y-6">
            <DeckSection 
              title="Side Deck" 
              section="side" 
              cards={currentDeck.sideDeck}
              limit={15}
              description="Cards that can be swapped between duels (max 15 cards)"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}