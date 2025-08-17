import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDeckStore } from "@/store/deckStore";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { yugiohAPI, YugiohCard } from "@/lib/api";
import { CardGrid } from "./CardGrid";
import { Loader2 } from "lucide-react";

interface CardDetailProps {
  card: YugiohCard;
}

export function CardDetail({ card }: CardDetailProps) {
  const addCardToDeck = useDeckStore((state) => state.addCardToDeck);
  const canAddCard = useDeckStore((state) => state.canAddCard);
  const { toast } = useToast();

  // Related cards by archetype
  const [related, setRelated] = useState<YugiohCard[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  useEffect(() => {
    let ignore = false;
    if (card.archetype) {
      setLoadingRelated(true);
      yugiohAPI.searchCards({ archetype: card.archetype }).then((cards) => {
        if (!ignore) {
          setRelated(cards.filter((c) => c.id !== card.id).slice(0, 8));
          setLoadingRelated(false);
        }
      });
    } else {
      setRelated([]);
    }
    return () => {
      ignore = true;
    };
  }, [card.archetype, card.id]);

  const isExtraDeckCard = () => {
    const extraDeckTypes = [
      "Fusion Monster",
      "Synchro Monster",
      "XYZ Monster",
      "Link Monster",
    ];
    return extraDeckTypes.includes(card.type);
  };

  const handleAddCard = (section: "main" | "extra" | "side") => {
    if (!canAddCard(section)) {
      const limits = { main: 60, extra: 15, side: 15 };
      toast({
        title: "Deck limit reached",
        description: `${section} deck is full (max ${limits[section]} cards)`,
        variant: "destructive",
      });
      return;
    }

    addCardToDeck(card, section);
    toast({
      title: "Card added",
      description: `${card.name} added to ${section} deck`,
    });
  };

  const getCardTypeColor = () => {
    if (card.type.includes("Monster")) return "text-amber-400";
    if (card.type.includes("Spell")) return "text-emerald-400";
    if (card.type.includes("Trap")) return "text-pink-400";
    return "text-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Image */}
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-gradient-card border border-border shadow-card">
            <img
              src={card.card_images[0]?.image_url || "/placeholder.svg"}
              alt={card.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Add to Deck Actions */}
          <div className="flex flex-col gap-2">
            <Button
              onClick={() =>
                handleAddCard(isExtraDeckCard() ? "extra" : "main")
              }
              disabled={!canAddCard(isExtraDeckCard() ? "extra" : "main")}
              className="w-full bg-gradient-primary hover:shadow-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add to {isExtraDeckCard() ? "Extra" : "Main"} Deck
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleAddCard("side")}
                disabled={!canAddCard("side")}
                className="border-border/50 hover:border-side-deck/50"
              >
                Add to Side
              </Button>
              {!isExtraDeckCard() && (
                <Button
                  variant="outline"
                  onClick={() => handleAddCard("extra")}
                  disabled={!canAddCard("extra")}
                  className="border-border/50 hover:border-extra-deck/50"
                >
                  Add to Extra
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Card Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {card.name}
            </h2>
            <div className="flex flex-wrap gap-2">
              <Badge className={`${getCardTypeColor()} bg-muted`}>
                {card.type}
              </Badge>
              {card.race && <Badge variant="outline">{card.race}</Badge>}
              {card.attribute && (
                <Badge variant="outline">{card.attribute}</Badge>
              )}
              {card.archetype && (
                <Badge variant="secondary">{card.archetype}</Badge>
              )}
            </div>
          </div>

          {/* Monster Stats */}
          {card.atk !== undefined && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gradient-card rounded-lg border border-border">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Level</div>
                <div className="text-xl font-bold text-primary">
                  {card.level || 0}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">ATK</div>
                <div className="text-xl font-bold text-destructive">
                  {card.atk}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">DEF</div>
                <div className="text-xl font-bold text-secondary">
                  {card.def}
                </div>
              </div>
            </div>
          )}

          {/* Card Description */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Description
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              {card.desc}
            </p>
          </div>

          {/* Card Sets */}
          {card.card_sets && card.card_sets.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                Card Sets
              </h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {card.card_sets.slice(0, 5).map((set, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-muted/20 rounded"
                  >
                    <span className="text-sm text-foreground">
                      {set.set_name}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {set.set_rarity}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Related Cards by Archetype */}
      {card.archetype && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Related "{card.archetype}" Cards
          </h3>
          {loadingRelated ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin w-4 h-4" /> Loading...
            </div>
          ) : related.length > 0 ? (
            <CardGrid cards={related} compact={true} />
          ) : (
            <div className="text-muted-foreground text-sm">
              No other cards found in this archetype.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
