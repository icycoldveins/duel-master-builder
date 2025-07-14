import { useState, useContext } from 'react';
import { Plus, Minus, Eye } from 'lucide-react';
import { YugiohCard } from '@/lib/api';
import { useDeckStore } from '@/store/deckStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
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
  const { openCardId, openCardData, setOpenCard } = useContext(CardDialogContext);

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
    const isOpen = openCardId === card.id;
    return (
      <Dialog open={isOpen} onOpenChange={open => setOpenCard(open ? card : null)}>
        <DialogTrigger asChild>
          <div className="relative w-14 h-20 flex-shrink-0 cursor-pointer group" onClick={() => setOpenCard(card)}>
            {!imageError && (
              <img
                src={card.card_images[0]?.image_url_small || card.card_images[0]?.image_url}
                alt={card.name}
                className={`w-full h-full object-cover rounded-md border border-border bg-muted/20 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            )}
            {!imageLoaded && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
                <div className="animate-pulse text-muted-foreground text-xs">...</div>
              </div>
            )}
            {imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/20 text-muted-foreground text-[10px] text-center p-1">
                {card.name}
              </div>
            )}
            {inDeck && count > 0 && (
              <Badge className="absolute top-1 right-1 bg-primary text-white text-[10px] px-1 py-0.5 rounded">
                {count}
              </Badge>
            )}
            {/* Add/Remove overlay */}
            <div className="absolute bottom-1 right-1 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-10 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              <Button size="icon" className="w-5 h-5 p-0 bg-gradient-primary text-white" onClick={e => { e.stopPropagation(); handleAddCard(isExtraDeckCard() ? 'extra' : 'main'); }}>
                <Plus className="w-3 h-3" />
              </Button>
              <Button size="icon" className="w-5 h-5 p-0 bg-destructive text-white" onClick={e => { e.stopPropagation(); handleRemoveCard(deckSection); }}>
                <Minus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardDetail card={card} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="group relative">
      <div className="bg-gradient-card border border-border rounded-lg p-3 transition-all duration-300 hover:shadow-card hover:scale-105 hover:-translate-y-2">
        {/* Card Image */}
        <div className="relative aspect-[3/4] mb-3 overflow-hidden rounded-md bg-muted/20">
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
            <Badge className={`absolute top-2 right-2 bg-${getCardRarityColor()} text-white font-bold`}>
              {count}
            </Badge>
          )}

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <CardDetail card={card} />
              </DialogContent>
            </Dialog>

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
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
            {card.name}
          </h3>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className="text-xs">
              {card.type}
            </Badge>
            {card.attribute && (
              <Badge variant="outline" className="text-xs">
                {card.attribute}
              </Badge>
            )}
            {card.level && (
              <Badge variant="outline" className="text-xs">
                Lv.{card.level}
              </Badge>
            )}
          </div>

          {card.atk !== undefined && (
            <div className="text-xs text-muted-foreground">
              ATK/{card.atk} DEF/{card.def}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}