import { YugiohCard } from "@/lib/api";
import { CardPreview } from "./CardPreview";
import { useContext } from "react";
import { CardDialogContext } from "./CardDialogProvider";

interface DeckCardDisplay extends YugiohCard {
  deckCount?: number;
  inDeck?: boolean;
  deckSection?: "main" | "extra" | "side";
}

interface CardGridProps {
  cards: (YugiohCard | DeckCardDisplay)[];
  compact?: boolean;
}

export function CardGrid({ cards, compact = false }: CardGridProps) {
  // No dialog state here
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
    <div
      className={`grid gap-4 ${compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"}`}
    >
      {cards.map((card, index) => {
        const deckCard = card as DeckCardDisplay;
        return (
          <div
            key={card.id}
            className="animate-scale-in"
            style={{ animationDelay: `${Math.min(index * 0.02, 0.3)}s` }}
          >
            <CardPreview
              card={card}
              inDeck={deckCard.inDeck || false}
              deckSection={deckCard.deckSection || "main"}
              count={deckCard.deckCount || 0}
              compact={compact}
            />
          </div>
        );
      })}
    </div>
  );
}
