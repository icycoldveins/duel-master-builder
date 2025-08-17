import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { yugiohAPI, YugiohCard, SearchFilters } from '@/lib/api';
import { CardGrid } from './CardGrid';
import { useToast } from '@/hooks/use-toast';
import { useDeckStore } from '@/store/deckStore';

export function CardSearch() {
  const [cards, setCards] = useState<YugiohCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();
  const currentDeck = useDeckStore(state => state.currentDeck);

  const searchCards = useCallback(async (term: string, searchFilters: SearchFilters = {}) => {
    setLoading(true);
    try {
      const results = await yugiohAPI.searchCards({
        fname: term || undefined,
        ...searchFilters
      });
      setCards(results);
      
      if (results.length === 0 && (term || Object.keys(searchFilters).length > 0)) {
        toast({
          title: "No cards found",
          description: "Try adjusting your search criteria",
        });
      }
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search cards. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load random cards on initial mount
  useEffect(() => {
    searchCards('');
  }, [searchCards]);

  // Enrich cards with inDeck, deckSection, and deckCount
  const enrichedCards = cards.map(card => {
    const main = currentDeck.mainDeck.find(dc => dc.card.id === card.id);
    if (main) return { ...card, inDeck: true, deckSection: 'main', deckCount: main.count };
    const extra = currentDeck.extraDeck.find(dc => dc.card.id === card.id);
    if (extra) return { ...card, inDeck: true, deckSection: 'extra', deckCount: extra.count };
    const side = currentDeck.sideDeck.find(dc => dc.card.id === card.id);
    if (side) return { ...card, inDeck: true, deckSection: 'side', deckCount: side.count };
    return { ...card, inDeck: false, deckCount: 0 };
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCards(searchTerm, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    setFilters(newFilters);
    searchCards(searchTerm, newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div>
        <h2 className="text-2xl font-bold text-gradient-accent mb-5">Card Search</h2>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent/60 h-5 w-5 transition-colors group-focus-within:text-accent" />
              <Input
                placeholder="Search cards by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 bg-black/30 backdrop-blur-md border-2 border-white/10 focus:border-accent/50 focus:bg-black/40 transition-all duration-300 rounded-2xl font-medium text-base placeholder:text-muted-foreground/50 hover:border-white/20"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-accent opacity-0 group-focus-within:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <Button 
              type="submit" 
              disabled={loading} 
              className="h-14 px-8 bg-gradient-accent hover:shadow-[0_0_30px_rgba(275,90%,70%,0.4)] transition-all duration-300 rounded-2xl font-semibold text-base"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-14 px-5 border-2 transition-all duration-300 rounded-2xl ${showFilters ? 'border-accent/50 bg-accent/10' : 'border-white/10 hover:border-accent/30 hover:bg-accent/5'}`}
            >
              <Filter className={`h-5 w-5 transition-transform duration-300 ${showFilters ? 'rotate-180 text-accent' : ''}`} />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-black/30 backdrop-blur-md rounded-2xl border-2 border-white/10 animate-scale-in">
              <Select onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger className="h-12 bg-black/40 border-white/10 hover:border-accent/30 hover:bg-black/50 transition-all duration-300 rounded-xl">
                  <SelectValue placeholder="Card Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Monster">Monster</SelectItem>
                  <SelectItem value="Spell">Spell</SelectItem>
                  <SelectItem value="Trap">Trap</SelectItem>
                  <SelectItem value="Fusion Monster">Fusion</SelectItem>
                  <SelectItem value="Synchro Monster">Synchro</SelectItem>
                  <SelectItem value="XYZ Monster">XYZ</SelectItem>
                  <SelectItem value="Link Monster">Link</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('race', value)}>
                <SelectTrigger className="h-12 bg-black/40 border-white/10 hover:border-accent/30 hover:bg-black/50 transition-all duration-300 rounded-xl">
                  <SelectValue placeholder="Race/Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Races</SelectItem>
                  <SelectItem value="Dragon">Dragon</SelectItem>
                  <SelectItem value="Spellcaster">Spellcaster</SelectItem>
                  <SelectItem value="Warrior">Warrior</SelectItem>
                  <SelectItem value="Machine">Machine</SelectItem>
                  <SelectItem value="Beast">Beast</SelectItem>
                  <SelectItem value="Fiend">Fiend</SelectItem>
                  <SelectItem value="Zombie">Zombie</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('attribute', value)}>
                <SelectTrigger className="h-12 bg-black/40 border-white/10 hover:border-accent/30 hover:bg-black/50 transition-all duration-300 rounded-xl">
                  <SelectValue placeholder="Attribute" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Attributes</SelectItem>
                  <SelectItem value="DARK">DARK</SelectItem>
                  <SelectItem value="LIGHT">LIGHT</SelectItem>
                  <SelectItem value="FIRE">FIRE</SelectItem>
                  <SelectItem value="WATER">WATER</SelectItem>
                  <SelectItem value="EARTH">EARTH</SelectItem>
                  <SelectItem value="WIND">WIND</SelectItem>
                  <SelectItem value="DIVINE">DIVINE</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(value) => handleFilterChange('level', value === 'all' ? undefined : parseInt(value))}>
                <SelectTrigger className="h-12 bg-black/40 border-white/10 hover:border-accent/30 hover:bg-black/50 transition-all duration-300 rounded-xl">
                  <SelectValue placeholder="Level/Rank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(level => (
                    <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </form>
      </div>

      {/* Results */}
      <div className="space-y-5">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-accent/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border border-white/10">
          <h3 className="text-lg font-semibold">
            {loading ? (
              <span className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                <span className="text-accent">Searching...</span>
              </span>
            ) : (
              <span className="bg-gradient-accent bg-clip-text text-transparent font-bold">
                {cards.length} {cards.length === 1 ? 'card' : 'cards'} found
              </span>
            )}
          </h3>
          {!loading && cards.length > 0 && (
            <span className="text-sm text-muted-foreground/70 font-medium">
              Click cards to add
            </span>
          )}
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-accent/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 blur-xl bg-accent/20 rounded-full animate-pulse"></div>
            </div>
            <p className="text-muted-foreground text-base font-medium">Loading cards...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent/20 to-purple-500/20 flex items-center justify-center animate-pulse">
              <Search className="h-12 w-12 text-accent/60" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-foreground">No cards found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your search criteria</p>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            <CardGrid cards={enrichedCards} compact={true} />
          </div>
        )}
      </div>
    </div>
  );
}