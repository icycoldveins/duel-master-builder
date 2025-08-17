import { useState, useContext } from 'react';
import { Plus, Minus, Eye } from 'lucide-react';
import { YugiohCard } from '@/lib/api';
import { useDeckStore } from '@/store/deckStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CardDetail } from './CardDetail';
import { useToast } from '@/hooks/use-toast';
import { CardDialogContext } from './CardDialogProvider';

interface CardPreviewProps {
  card: YugiohCard;
  inDeck?: boolean;
  deckSection?: 'main' | 'extra' | 'side';
  count?: number;
  compact?: boolean;
}

export function CardPreview({ card, inDeck = false, deckSection = 'main', count = 0, compact = false }: CardPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const addCardToDeck = useDeckStore(state => state.addCardToDeck);
  const removeCardFromDeck = useDeckStore(state => state.removeCardFromDeck);
  const canAddCard = useDeckStore(state => state.canAddCard);
  const getDeckStats = useDeckStore(state => state.getDeckStats);
  const { toast } = useToast();
  const { openCard } = useContext(CardDialogContext);

  const handleAddCard = (section: 'main' | 'extra' | 'side' = deckSection) => {
    if (!canAddCard(section)) {
      const limits = { main: 60, extra: 15, side: 15 };
      toast({
        title: "Deck limit reached",
        description: `${section} deck is full (max ${limits[section]} cards)`,
        variant: "destructive"
      });
      return;
    }

    addCardToDeck(card, section);
    toast({
      title: "Card added",
      description: `${card.name} added to ${section} deck`,
    });
  };

  const handleRemoveCard = (section?: 'main' | 'extra' | 'side') => {
    removeCardFromDeck(card.id, section ?? (isExtraDeckCard() ? 'extra' : 'main'));
  };

  const getCardRarityColor = () => {
    const rarity = card.card_sets?.[0]?.set_rarity?.toLowerCase();
    if (rarity?.includes('ultra')) return 'ultra-rare';
    if (rarity?.includes('super')) return 'super-rare';
    if (rarity?.includes('rare')) return 'rare';
    return 'common';
  };

  const isExtraDeckCard = () => {
    const extraDeckTypes = ['Fusion Monster', 'Synchro Monster', 'XYZ Monster', 'Link Monster'];
    return extraDeckTypes.includes(card.type);
  };

  if (compact) {
    return (
      <div
        className="relative w-full aspect-[3/4] cursor-pointer group card-hover overflow-hidden rounded-lg"
        onClick={() => openCard(card)}
        tabIndex={0}
        role="button"
        aria-label={`View details for ${card.name}`}
      >
        {!imageError && (
          <img
            src={card.card_images[0]?.image_url_small || card.card_images[0]?.image_url}
            alt={card.name}
            className={`w-full h-full object-cover border-2 border-border/50 bg-muted/20 transition-all duration-300 group-hover:border-primary/50 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 shimmer rounded-lg">
            <div className="text-muted-foreground text-xs">Loading...</div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground text-[10px] text-center p-1">
            {card.name}
          </div>
        )}
        {inDeck && count > 0 && (
          <Badge className="absolute top-2 right-2 bg-gradient-primary text-white font-bold px-2 py-1 shadow-lg">
            {count}
          </Badge>
        )}
        {/* Add/Remove overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-2">
          <div className="flex gap-2">
            <Button 
              size="icon" 
              className="w-8 h-8 bg-gradient-primary text-white hover:shadow-glow transition-all" 
              onClick={e => { e.stopPropagation(); handleAddCard(isExtraDeckCard() ? 'extra' : 'main'); }}
            >
              <Plus className="w-4 h-4" />
            </Button>
            {count > 0 && (
              <Button 
                size="icon" 
                className="w-8 h-8 bg-destructive text-white hover:shadow-lg transition-all" 
                onClick={e => { e.stopPropagation(); handleRemoveCard(deckSection); }}
              >
                <Minus className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="glass border-gradient rounded-xl p-4 transition-all duration-300 hover:shadow-hover hover:scale-105 hover:-translate-y-2 card-hover">
        {/* Card Image */}
        <div className="relative aspect-[3/4] mb-4 overflow-hidden rounded-lg bg-gradient-to-br from-muted/20 to-muted/10">
          {!imageError && (
            <img
              src={card.card_images[0]?.image_url_small || card.card_images[0]?.image_url}
              alt={card.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
          
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground text-xs text-center p-2">
              {card.name}
            </div>
          )}

          {/* Card count badge for deck view */}
          {inDeck && count > 0 && (
            <Badge className="absolute top-2 right-2 bg-gradient-primary text-white font-bold shadow-lg px-3 py-1">
              ×{count}
            </Badge>
          )}

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={e => { e.stopPropagation(); openCard(card); }}
              aria-label={`View details for ${card.name}`}
            >
              <Eye className="h-4 w-4" />
            </Button>

            {!inDeck && (
              <Button 
                size="sm" 
                onClick={() => handleAddCard(isExtraDeckCard() ? 'extra' : 'main')}
                className="h-8 w-8 p-0 bg-gradient-primary hover:shadow-glow"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}

            {inDeck && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => handleAddCard()}
                  disabled={count >= 3 || !canAddCard(deckSection)}
                  className="h-8 w-8 p-0 bg-gradient-primary hover:shadow-glow"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => handleRemoveCard(deckSection)}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Card Info */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight hover:text-primary transition-colors">
            {card.name}
          </h3>
          
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs bg-muted/50 border-primary/30">
              {card.type}
            </Badge>
            {card.attribute && (
              <Badge variant="outline" className="text-xs bg-muted/50 border-accent/30">
                {card.attribute}
              </Badge>
            )}
            {card.level && (
              <Badge variant="outline" className="text-xs bg-muted/50 border-secondary/30">
                Lv.{card.level}
              </Badge>
            )}
          </div>

          {card.atk !== undefined && (
            <div className="text-xs font-medium text-muted-foreground flex items-center gap-2">
              <span className="text-primary">ATK/{card.atk}</span>
              <span className="text-accent">DEF/{card.def}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}