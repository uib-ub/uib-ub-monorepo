'use client'
import { facetConfig } from '@/config/search-config';
import { useDataset, useSearchQuery } from '@/lib/search-params';
import { usePathname, useSearchParams } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react'
import { SearchContext } from './search-provider';

interface FacetOption {
  sort: 'doc_count' | 'asc' | 'desc';
  isPinned: boolean;
  filters: Array<[string, string]>;
}

interface DatasetOptions {
  facets: Record<string, FacetOption>;
  pinned: Array<[string, string]>;
}

interface FacetOptions extends Record<string, DatasetOptions> {}

interface GlobalContextData {
  currentUrl: string | null;
  setCurrentUrl: (url: string | null) => void;
  isMobile: boolean;
  facetOptions: FacetOptions;
  updateFacetOption: (facetName: string, updates: Partial<FacetOption>) => void;
  setPinnedFilters: (filters: [string, string][]) => void;
}

export const GlobalContext = createContext<GlobalContextData>({
  currentUrl: null,
  setCurrentUrl: () => {},
  isMobile: false,
  facetOptions: {},
  updateFacetOption: () => {},
  setPinnedFilters: () => {}
});

export default function GlobalProvider({ children, isMobile }: { children: React.ReactNode, isMobile: boolean }) {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [facetOptions, setFacetOptions] = useState<FacetOptions>({});
  const dataset = useDataset()

  // Load facet options from localStorage on mount
  useEffect(() => {
    const storedOptions = localStorage.getItem('facetOptions');
    if (storedOptions) {
      setFacetOptions(JSON.parse(storedOptions));
    }
  }, []);

  // Update localStorage when facet options change
  useEffect(() => {
    localStorage.setItem('facetOptions', JSON.stringify(facetOptions));
  }, [facetOptions]);

  const updateFacetOption = (facetName: string, updates: Partial<FacetOption>) => {
    setFacetOptions(prev => ({
      ...prev,
      [dataset]: {
        ...prev[dataset] || { facets: {}, pinned: [] },
        facets: {
          ...(prev[dataset]?.facets || {}),
          [facetName]: {
            ...(prev[dataset]?.facets?.[facetName] || { 
              sort: facetConfig[dataset].find(item => item.key == facetName)?.sort || 'doc_count', 
              isPinned: false,
              filters: []
            }),
            ...updates
          }
        }
      }
    }));
  };

  const setPinnedFilters = (filters: [string, string][]) => {
    setFacetOptions(prev => ({
      ...prev,
      [dataset]: {
        ...prev[dataset] || { facets: {}, pinned: [] },
        pinned: filters
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
        setPinnedFilters
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

