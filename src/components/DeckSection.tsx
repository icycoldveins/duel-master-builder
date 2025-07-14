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
      <div className="bg-gradient-card p-6 rounded-xl border border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground text-sm">{description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {isComplete && isValid && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
            {!isValid && totalCards > 0 && (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            )}
            <Badge 
              variant={isValid ? "default" : "destructive"} 
              className={`bg-${getSectionColor()}/20 text-${getSectionColor()} border-${getSectionColor()}/30`}
            >
              {totalCards}/{limit} cards
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progressPercentage} 
            className="h-2"
            style={{
              background: `hsl(var(--${getSectionColor()}) / 0.2)`
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {minCards && `Min: ${minCards} cards`}
            </span>
            <span>
              {totalCards > limit && (
                <span className="text-destructive font-medium">Over limit!</span>
              )}
              {minCards && totalCards < minCards && (
                <span className="text-yellow-500 font-medium">
                  Need {minCards - totalCards} more cards
                </span>
              )}
              {isValid && isComplete && (
                <span className="text-green-500 font-medium">Valid deck size</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {cards.length > 0 ? (
        <div className="bg-gradient-card p-6 rounded-xl border border-border shadow-card">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {cards.map((deckCard) => (
              <CardPreview 
                key={deckCard.card.id} 
                card={deckCard.card} 
                inDeck={true}
                deckSection={section}
                count={deckCard.count}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-card p-12 rounded-xl border border-border shadow-card text-center">
          <div className="text-muted-foreground space-y-2">
            <div className="text-lg font-medium">No cards in {title.toLowerCase()}</div>
            <div className="text-sm">
              Search for cards and add them to build your deck
            </div>
          </div>
        </div>
      )}

      {/* Card List View (Optional detailed view) */}
      {cards.length > 0 && (
        <div className="bg-gradient-card rounded-xl border border-border shadow-card">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">Deck List</h3>
          </div>
          <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
            {cards
              .sort((a, b) => a.card.name.localeCompare(b.card.name))
              .map((deckCard) => (
                <div 
                  key={deckCard.card.id} 
                  className="flex items-center justify-between p-2 hover:bg-muted/20 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-6 flex items-center justify-center">
                      {deckCard.count}
                    </Badge>
                    <span className="text-sm text-foreground">{deckCard.card.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Badge variant="outline" className="text-xs">
                      {deckCard.card.type}
                    </Badge>
                    {deckCard.card.attribute && (
                      <Badge variant="outline" className="text-xs">
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