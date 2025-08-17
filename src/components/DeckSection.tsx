import { DeckCard } from '@/store/deckStore';
import { CardPreview } from './CardPreview';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface DeckSectionProps {
  title: string;
  section: 'main' | 'extra' | 'side';
  cards: DeckCard[];
  limit: number;
  minCards?: number;
  description: string;
}

export function DeckSection({ title, section, cards, limit, minCards, description }: DeckSectionProps) {
  const totalCards = cards.reduce((sum, card) => sum + card.count, 0);
  const progressPercentage = (totalCards / limit) * 100;
  
  const isValid = minCards ? totalCards >= minCards && totalCards <= limit : totalCards <= limit;
  const isComplete = minCards ? totalCards >= minCards : totalCards > 0;

  const getSectionColor = () => {
    switch (section) {
      case 'main': return 'main-deck';
      case 'extra': return 'extra-deck';
      case 'side': return 'side-deck';
      default: return 'primary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="glass-dark rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className={`absolute inset-0 opacity-5 bg-gradient-to-br 
          ${section === 'main' ? 'from-blue-500 to-cyan-500' : ''}
          ${section === 'extra' ? 'from-purple-500 to-pink-500' : ''}
          ${section === 'side' ? 'from-yellow-500 to-orange-500' : ''}
        `}></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-3xl font-bold flex items-center gap-3
                ${section === 'main' ? 'text-gradient-primary' : ''}
                ${section === 'extra' ? 'text-gradient-accent' : ''}
                ${section === 'side' ? 'text-gradient-secondary' : ''}
              `}>
                {title}
                {isComplete && isValid && (
                  <CheckCircle className="h-6 w-6 text-green-500 animate-scale-in" />
                )}
              </h2>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{description}</p>
            </div>
          
            <div className="flex items-center gap-3">
              {!isValid && totalCards > 0 && (
                <AlertTriangle className="h-5 w-5 text-yellow-500 animate-pulse" />
              )}
              <div className={`px-5 py-3 rounded-2xl backdrop-blur-lg border transition-all duration-300
                ${section === 'main' ? 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20' : ''}
                ${section === 'extra' ? 'bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20' : ''}
                ${section === 'side' ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20' : ''}
              `}>
                <span className="text-2xl font-bold">
                  {totalCards}
                  <span className="text-muted-foreground text-base">/{limit}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

          {/* Enhanced Progress Bar */}
          <div className="space-y-3">
            <div className="relative h-4 bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
              <div 
                className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out
                  ${section === 'main' ? 'bg-gradient-to-r from-blue-400 to-cyan-400' : ''}
                  ${section === 'extra' ? 'bg-gradient-to-r from-purple-400 to-pink-400' : ''}
                  ${section === 'side' ? 'bg-gradient-to-r from-yellow-400 to-orange-400' : ''}
                `}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-shimmer"></div>
              </div>
            </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {minCards && `Minimum: ${minCards} cards`}
            </span>
            <span className="font-medium">
              {totalCards > limit && (
                <span className="text-destructive animate-pulse">Over limit by {totalCards - limit}!</span>
              )}
              {minCards && totalCards < minCards && (
                <span className="text-yellow-500">
                  Need {minCards - totalCards} more cards
                </span>
              )}
              {isValid && isComplete && (
                <span className="text-green-500">✓ Valid deck size</span>
              )}
            </span>
            </div>
          </div>
        </div>

      {/* Cards Display */}
      {cards.length > 0 ? (
        <div className="glass-dark rounded-3xl p-6 shadow-2xl border border-white/10 hover:border-white/20 transition-all duration-500">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map((deckCard, index) => (
              <div 
                key={deckCard.card.id}
                className="animate-scale-in"
                style={{ animationDelay: `${index * 0.02}s` }}
              >
                <CardPreview 
                  card={deckCard.card} 
                  inDeck={true}
                  deckSection={section}
                  count={deckCard.count}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-dark rounded-3xl p-20 shadow-2xl text-center border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-mesh opacity-10"></div>
          <div className="relative text-muted-foreground space-y-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center animate-pulse">
              <div className="text-4xl">🎴</div>
            </div>
            <div className="text-xl font-medium">No cards in {title.toLowerCase()}</div>
            <div className="text-base opacity-70 max-w-xs mx-auto">
              Search for cards and add them to build your deck
            </div>
          </div>
        </div>
      )}

      {/* Card List View (Optional detailed view) */}
      {cards.length > 0 && (
        <div className="glass-dark rounded-3xl shadow-2xl overflow-hidden border border-white/10">
          <div className={`p-5 border-b border-white/10
            ${section === 'main' ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10' : ''}
            ${section === 'extra' ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : ''}
            ${section === 'side' ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10' : ''}
          `}>
            <h3 className="font-semibold text-lg flex items-center gap-3">
              <span className="text-2xl">📋</span> 
              <span className="text-gradient-primary">Deck List</span>
            </h3>
          </div>
          <div className="p-4 space-y-1 max-h-64 overflow-y-auto">
            {cards
              .sort((a, b) => a.card.name.localeCompare(b.card.name))
              .map((deckCard, index) => (
                <div 
                  key={deckCard.card.id} 
                  className="flex items-center justify-between p-3 hover:bg-primary/5 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-sm">
                      {deckCard.count}
                    </div>
                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                      {deckCard.card.name}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs bg-muted/50">
                      {deckCard.card.type}
                    </Badge>
                    {deckCard.card.attribute && (
                      <Badge variant="outline" className="text-xs bg-muted/50">
                        {deckCard.card.attribute}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}