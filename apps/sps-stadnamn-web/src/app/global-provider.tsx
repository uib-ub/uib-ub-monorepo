'use client'
import { facetConfig } from '@/config/search-config';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import { usePathname, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react'
import { SearchContext } from './search-provider';

interface FacetOption {
  sort: 'doc_count' | 'asc' | 'desc';
  isPinned: boolean;
  filters: string[][];
}

interface FacetOptions {
  [key: string]: FacetOption; // Format: "dataset:facetName"
}

interface GlobalContextData {
  currentUrl: string | null;
  setCurrentUrl: (url: string | null) => void;
  isMobile: boolean;
  facetOptions: FacetOptions;
  updateFacetOption: (facetName: string, updates: Partial<FacetOption>) => void;
  
  setPinnedFilters: (filters: [string, string][]) => void;
  pinnedFilters: [string, string][]
}

export const GlobalContext = createContext<GlobalContextData>({
  currentUrl: null,
  setCurrentUrl: () => {},
  isMobile: false,
  facetOptions: {},
  updateFacetOption: () => {},
  setPinnedFilters: () => {},
  pinnedFilters: []
  
});

export default function GlobalProvider({ children, isMobile }: { children: React.ReactNode, isMobile: boolean }) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [facetOptions, setFacetOptions] = useState<FacetOptions>({});
  const [pinnedFilters, setPinnedFilters] = useState<[string, string][]>([])
  const dataset = useDataset()

  // Load facet options from localStorage on mount
  useEffect(() => {
    const storedOptions = localStorage.getItem('facetOptions');
    if (storedOptions) {
      setFacetOptions(JSON.parse(storedOptions));
    }
    const storedPinnedFilters = localStorage.getItem('pinnedFilters');
    if (storedPinnedFilters) {
      setPinnedFilters(JSON.parse(storedPinnedFilters));
    }

  }, []);


  // Update localStorage when facet options change
  useEffect(() => {
    localStorage.setItem('facetOptions', JSON.stringify(facetOptions));
  }, [facetOptions]);

  useEffect(() => {
    localStorage.setItem('pinnedFilters', JSON.stringify(pinnedFilters));
  }, [pinnedFilters]);

  const updateFacetOption = (facetName: string, updates: Partial<FacetOption>) => {
    const key = `${dataset}:${facetName}`;
    setFacetOptions(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || { sort: facetConfig[dataset].find(item => item.key == facetName)?.sort || 'doc_count', isPinned: false }),
        ...updates
      }
    }));
  };


    

  return (
    <GlobalContext.Provider 
      value={{
        currentUrl,
        setCurrentUrl,
        isMobile,
        facetOptions,
        updateFacetOption,
        setPinnedFilters,
        pinnedFilters
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

