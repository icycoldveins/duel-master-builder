import { Deck } from '@/store/deckStore';
import { CardPreview } from './CardPreview';
import { Badge } from '@/components/ui/badge';

interface DeckPreviewProps {
  deck: Deck;
}

export function DeckPreview({ deck }: DeckPreviewProps) {
  const sectionData = [
    {
      title: 'Main Deck',
      cards: deck.mainDeck,
      section: 'main' as const,
      color: 'main-deck',
      limit: 60,
    },
    {
      title: 'Extra Deck',
      cards: deck.extraDeck,
      section: 'extra' as const,
      color: 'extra-deck',
      limit: 15,
    },
    {
      title: 'Side Deck',
      cards: deck.sideDeck,
      section: 'side' as const,
      color: 'side-deck',
      limit: 15,
    },
  ];

  return (
    <div className="bg-gradient-card border border-border rounded-xl p-4 mb-4 shadow-card">
      <h2 className="text-base font-semibold mb-1 text-foreground">Deck Preview</h2>
      <div className="space-y-2">
        {sectionData.map(({ title, cards, section, color, limit }) => (
          <div key={section}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-semibold text-${color}`}>{title}</span>
              <Badge className={`bg-${color}/20 text-${color} border-${color}/30 text-xs`}>{cards.reduce((sum, c) => sum + c.count, 0)}/{limit}</Badge>
            </div>
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {cards.slice(0, 12).map(deckCard => (
                <div key={deckCard.card.id} className="relative">
                  <CardPreview 
                    card={deckCard.card} 
                    inDeck={true} 
                    deckSection={section} 
                    count={deckCard.count} 
                    compact={true}
                  />
                </div>
              ))}
              {cards.length > 12 && (
                <span className="ml-1 text-[10px] text-muted-foreground">+{cards.length - 12} more</span>
              )}
              {cards.length === 0 && (
                <span className="text-[10px] text-muted-foreground">No cards</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 