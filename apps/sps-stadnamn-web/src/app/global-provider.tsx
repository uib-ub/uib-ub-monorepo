'use client'
import { facetConfig } from '@/config/search-config';
import { useDataset } from '@/lib/search-params';
import { createContext, useEffect, useState } from 'react'

interface FacetOption {
  sort: 'doc_count' | 'asc' | 'desc';
  pinningActive: boolean;
}

export const GlobalContext = createContext({
  currentUrl: null as string | null,    
  setCurrentUrl: (url: string | null) => {},
  isMobile: false,
  facetOptions: {} as Record<string, Record<string, Partial<FacetOption>>>,
  pinnedFilters: {} as Record<string, [string, string][]>,
  updateFacetOption: (facetName: string, options: Partial<FacetOption>) => {},
  updatePinnedFilters: (filters: [string, string][]) => {},
  sosiVocab: {} as Record<string, any>,
});

export default function GlobalProvider({ children, isMobile, sosiVocab }: { children: React.ReactNode, isMobile: boolean, sosiVocab: Record<string, any> }) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [facetOptions, setFacetOptions] = useState<Record<string, Record<string, Partial<FacetOption>>>>({});
  const [pinnedFilters, setPinnedFilters] = useState<Record<string, [string, string][]>>({});
  const dataset = useDataset()

  // Load facet options from localStorage on mount
  useEffect(() => {
    const storedOptions = localStorage.getItem('facetOptions');
    if (storedOptions) {
        console.log("Loading facet options from localStorage")
      setFacetOptions(JSON.parse(storedOptions));
    }

    const storedPinnedFilters = localStorage.getItem('pinnedFilters');
    if (storedPinnedFilters) {
        console.log("Loading pinned filters from localStorage")
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

  const updateFacetOption = (facetName: string, options: Partial<FacetOption>) => {
    setFacetOptions(prev => ({
      ...prev,
      [dataset]: {
        ...prev[dataset] || {},
        [facetName]: {
          ...(prev[dataset]?.[facetName] || { 
            sort: facetConfig[dataset].find(item => item.key == facetName)?.sort || 'doc_count', 
            pinningActive: false,
          }),
          ...options
        }
      }
    }));
  };

  const updatePinnedFilters = (filters: [string, string][]) => {
    setPinnedFilters(prev => ({
      ...prev,
      [dataset]: filters
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
        pinnedFilters,
        updatePinnedFilters,
        sosiVocab,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

