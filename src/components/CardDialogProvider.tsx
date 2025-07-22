import { createContext, useState, ReactNode, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CardDetail } from './CardDetail';
import { YugiohCard } from '@/lib/api';

export const CardDialogContext = createContext<{
  openCard: (card: YugiohCard) => void;
  closeCard: () => void;
  isDialogOpen: boolean;
  selectedCard: YugiohCard | null;
}>({
  openCard: () => {},
  closeCard: () => {},
  isDialogOpen: false,
  selectedCard: null,
});

export function CardDialogProvider({ children }: { children: ReactNode }) {
  const [selectedCard, setSelectedCard] = useState<YugiohCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const openCard = useCallback((card: YugiohCard) => {
    setSelectedCard(card);
    setIsDialogOpen(true);
  }, []);

  const closeCard = useCallback(() => {
    setIsDialogOpen(false);
    setSelectedCard(null);
  }, []);

  const value = { openCard, closeCard, isDialogOpen, selectedCard };

  return (
    <CardDialogContext.Provider value={value}>
      {children}
      <Dialog open={isDialogOpen} onOpenChange={open => (open ? setIsDialogOpen(true) : closeCard())}>
        {selectedCard && (
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCard.name}</DialogTitle>
              <DialogDescription>
                Detailed view of {selectedCard.name}
              </DialogDescription>
            </DialogHeader>
            <CardDetail card={selectedCard} />
          </DialogContent>
        )}
      </Dialog>
    </CardDialogContext.Provider>
  );
}