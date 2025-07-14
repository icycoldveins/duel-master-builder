import { createContext, useState, ReactNode } from 'react';
import { YugiohCard } from '@/lib/api';

export const CardDialogContext = createContext<{
  openCardId: number | null;
  openCardData: YugiohCard | null;
  setOpenCard: (card: YugiohCard | null) => void;
}>({ openCardId: null, openCardData: null, setOpenCard: () => {} });

export function CardDialogProvider({ children }: { children: ReactNode }) {
  const [openCardId, setOpenCardId] = useState<number | null>(null);
  const [openCardData, setOpenCardData] = useState<YugiohCard | null>(null);
  const setOpenCard = (card: YugiohCard | null) => {
    setOpenCardId(card ? card.id : null);
    setOpenCardData(card);
  };
  return (
    <CardDialogContext.Provider value={{ openCardId, openCardData, setOpenCard }}>
      {children}
    </CardDialogContext.Provider>
  );
} 