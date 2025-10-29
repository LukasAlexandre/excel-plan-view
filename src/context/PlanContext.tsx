import React, { createContext, useContext, useState } from 'react';
import type { ParsedData } from '@/types/excel';

type Shift = '1' | '2' | null;

interface PlanContextValue {
  uploadedFile: File | null;
  setUploadedFile: (f: File | null) => void;
  parsedData: ParsedData | null;
  setParsedData: (d: ParsedData | null) => void;
  selectedShift: Shift;
  setSelectedShift: (s: Shift) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
  resetAll: () => void;
}

const PlanContext = createContext<PlanContextValue | undefined>(undefined);

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetAll = () => {
    setUploadedFile(null);
    setParsedData(null);
    setSelectedShift(null);
    setIsLoading(false);
  };

  return (
    <PlanContext.Provider
      value={{
        uploadedFile,
        setUploadedFile,
        parsedData,
        setParsedData,
        selectedShift,
        setSelectedShift,
        isLoading,
        setIsLoading,
        resetAll,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
};
