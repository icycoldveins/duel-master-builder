import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { yugiohAPI, YugiohCard, SearchFilters } from '@/lib/api';
import { CardGrid } from './CardGrid';
import { useToast } from '@/hooks/use-toast';

export function CardSearch() {
  const [cards, setCards] = useState<YugiohCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const { toast } = useToast();

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchCards(searchTerm, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value === 'all' ? undefined : value };
    setFilters(newFilters);
    searchCards(searchTerm, newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-gradient-card p-6 rounded-xl border border-border shadow-card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search cards by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-input/50 border-border/50 focus:bg-input focus:border-primary/50 transition-all"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-gradient-primary hover:shadow-glow transition-all">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-border/50 hover:border-primary/50 transition-all"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/20 rounded-lg border border-border/30">
              <Select onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
                <SelectTrigger>
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {loading ? 'Searching...' : `Found ${cards.length} cards`}
          </h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <CardGrid cards={cards} />
        )}
      </div>
    </div>
  );
}