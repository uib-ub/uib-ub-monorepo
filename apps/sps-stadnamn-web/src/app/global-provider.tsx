'use client'
import { createContext } from 'react'
import { useState } from 'react';

interface GlobalContextData {
    currentUrl: string | null;
    setCurrentUrl: (url: string | null) => void;
    isMobile: boolean;
  }
 
  export const GlobalContext = createContext<GlobalContextData>({
    currentUrl: null,
    setCurrentUrl: () => {},
    isMobile: false
    });

 
export default function GlobalProvider({ children, isMobile }: { children: React.ReactNode, isMobile: boolean }) {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null)

    return <GlobalContext.Provider value={{
        currentUrl,
        setCurrentUrl,
        isMobile,
    }}>{children}</GlobalContext.Provider>
}




