'use client'
import { facetConfig } from '@/config/search-config';
import { usePerspective } from '@/lib/param-hooks';
import { usePathname, useSearchParams } from 'next/navigation';
import { createContext, useEffect, useRef, useState } from 'react'

interface FacetOption {
  sort: 'doc_count' | 'asc' | 'desc';
  pinningActive: boolean;
}

export const GlobalContext = createContext({
  currentUrl: { current: null as string | null },
  isMobile: false,
  facetOptions: {} as Record<string, Record<string, Partial<FacetOption>>>,
  updateFacetOption: (facetName: string, options: Partial<FacetOption>) => {},
  coordinateVocab: {} as Record<string, any>,
  sosiVocab: {} as Record<string, any>,
  preferredTabs: {} as Record<string, string>,
  setPreferredTab: (dataset: string, tab: string) => {},
  visibleColumns: {} as Record<string, string[]>,
  setVisibleColumns: (dataset: string, columns: string[]) => {},
  inputValue: { current: '' as string },
  initialUrl: { current: null as string | null },
  highlightedGroup: { current: null as string | null },
});

export default function GlobalProvider({ children, isMobile, sosiVocab, coordinateVocab }: { children: React.ReactNode, isMobile: boolean, sosiVocab: Record<string, any>, coordinateVocab: Record<string, any> }) {
  const currentUrl = useRef<string | null>(null);
  const [facetOptions, setFacetOptions] = useState<Record<string, Record<string, Partial<FacetOption>>>>({});
  const perspective = usePerspective()
  const [preferredTabs, setPreferredTabs] = useState<Record<string, string>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, string[]>>({
    [perspective]: ['adm', ...facetConfig[perspective].filter(item => item.table).map(facet => facet.key)]
  });
  const searchParams = useSearchParams()
  const inputValue = useRef<string>('');
  const initialUrl = useRef<string | null>(null);
  const highlightedGroup = useRef<string | null>(null);
  const searchParamsString = searchParams.toString()
  const pathname = usePathname()


  // Load facet options from localStorage on mount
  useEffect(() => {
    const storedOptions = localStorage.getItem('facetOptions');
    if (storedOptions) {
        console.log("Loading facet options from localStorage")
      setFacetOptions(JSON.parse(storedOptions));
    }

    const storedPreferredTabs = localStorage.getItem('preferredTabs');
    if (storedPreferredTabs) {
      setPreferredTabs(JSON.parse(storedPreferredTabs));
    }
  }, []);


    // Set url for navigation back to search
    useEffect(() => {
      if (searchParamsString && pathname == '/search') {
        currentUrl.current = "/search?" + searchParamsString
      }}, [searchParamsString, pathname])


  // Update localStorage when facet options change
  useEffect(() => {
    localStorage.setItem('facetOptions', JSON.stringify(facetOptions));
  }, [facetOptions]);


  useEffect(() => {
    localStorage.setItem('preferredTabs', JSON.stringify(preferredTabs));
  }, [preferredTabs]);

  useEffect(() => {
    localStorage.setItem(`visibleColumns_${perspective}`, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  const updateFacetOption = (facetName: string, options: Partial<FacetOption>) => {
    setFacetOptions(prev => ({
      ...prev,
      [perspective]: {
        ...prev[perspective] || {},
        [facetName]: {
          ...(prev[perspective]?.[facetName] || { 
            sort: facetConfig[perspective].find(item => item.key == facetName)?.sort || 'doc_count', 
            pinningActive: false,
          }),
          ...options
        }
      }
    }));
  };

  const setPreferredTab = (perspective: string, tab: string) => {
    setPreferredTabs(prev => ({
      ...prev,
      [perspective]: tab
    }));
  };

  const setVisibleColumnsHandler = (perspective: string, columns: string[]) => {
    setVisibleColumns(prev => ({
      ...prev,
      [perspective]: columns
    }));
  };

  return (
    <GlobalContext.Provider 
      value={{
        currentUrl,
        isMobile,
        facetOptions,
        updateFacetOption,
        sosiVocab,
        coordinateVocab,
        preferredTabs,
        setPreferredTab,
        visibleColumns,
        setVisibleColumns: setVisibleColumnsHandler,
        inputValue,
        initialUrl,
        highlightedGroup
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

