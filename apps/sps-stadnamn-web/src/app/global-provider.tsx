'use client'
import { createContext } from 'react'
import { useState } from 'react';

interface GlobalContextData {
    currentUrl: string | null;
    setCurrentUrl: (url: string | null) => void;
  }
 
  export const GlobalContext = createContext<GlobalContextData>({
    currentUrl: null,
    setCurrentUrl: () => {},

    });

 
export default function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [currentUrl, setCurrentUrl] = useState<string | null>(null)
    
    return <GlobalContext.Provider value={{
        currentUrl,
        setCurrentUrl
    }}>{children}</GlobalContext.Provider>
}




