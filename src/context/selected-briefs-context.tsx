'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type SelectedBriefsContextType = {
  selectedBriefs: any[];
  setSelectedBriefs: (briefs: any[]) => void;
};

const SelectedBriefsContext = createContext<SelectedBriefsContextType | undefined>(undefined);

export const SelectedBriefsProvider = ({ children }: { children: ReactNode }) => {
  const [selectedBriefs, setSelectedBriefs] = useState<any[]>([]);

   React.useEffect(() => {
    // console.log('SelectedBriefsContext:', selectedBriefs);
  }, [selectedBriefs]);

  return (
    <SelectedBriefsContext.Provider value={{ selectedBriefs, setSelectedBriefs }}>
      {children}
    </SelectedBriefsContext.Provider>
  );
};

export const useSelectedBriefs = () => {
  const context = useContext(SelectedBriefsContext);
  if (!context) {
    throw new Error('useSelectedBriefs must be used within a SelectedBriefsProvider');
  }
  return context;
};