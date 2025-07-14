import { YugiohCard } from '@/lib/api';
import { CardPreview } from './CardPreview';

interface DeckCardDisplay extends YugiohCard {
  deckCount?: number;
  inDeck?: boolean;
  deckSection?: 'main' | 'extra' | 'side';
}

interface CardGridProps {
  cards: (YugiohCard | DeckCardDisplay)[];
}

export function CardGrid({ cards }: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg">No cards found</div>
        <div className="text-muted-foreground/70 text-sm mt-2">
          Try adjusting your search criteria
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {cards.map((card) => {
        const deckCard = card as DeckCardDisplay;
        return (
          <CardPreview 
            key={card.id} 
            card={card} 
            inDeck={deckCard.inDeck || false}
            deckSection={deckCard.deckSection || 'main'}
            count={deckCard.deckCount || 0}
          />
        );
      })}
    </div>
  );
}