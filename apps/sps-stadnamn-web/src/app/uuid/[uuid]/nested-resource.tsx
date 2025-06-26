"use client";

import { useState, useEffect } from "react";
import { PiCaretDown, PiCaretDownBold, PiCaretUp, PiCaretUpBold } from "react-icons/pi";
import { usePathname, useRouter } from "next/navigation";

interface NestedResourceProps {
  uri: string;
  children: React.ReactNode;
  parentUuid?: string;
  childUuids?: string[];
}

export default function NestedResource({ uri, children, parentUuid, childUuids = [] }: NestedResourceProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Extract UUID from URI
  const getUuid = (uri: string): string | undefined => {
    const match = uri.match(/\/uuid\/([^/#]+)/)
    return match ? match[1] : undefined
  };

  // Check URL fragment on mount and when hash changes
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined') {
        const fragment = window.location.hash.slice(1) || '';
        const uuid = getUuid(uri);
        
        if (fragment === uuid || childUuids.includes(fragment)) {
          setOpen(true);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, [uri, childUuids]);

  const uuid = getUuid(uri);
  const routeUuid = pathname.split('/').pop();
  
  // Build URLs with proper fragment handling
  const parentUrl = parentUuid ? 
    (parentUuid === routeUuid ? pathname : `${pathname}#${parentUuid}`) : 
    pathname;
    
  const href = uuid ? `${pathname}#${uuid}` : pathname;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 no-underline"
          onClick={() => {
            if (open) {
              router.push(parentUrl, { scroll: false });
              setOpen(false);
            } else {
              router.push(href, { scroll: false });
              setOpen(true);
            }
          }}
          aria-expanded={open}
          aria-controls={`${uuid}-content`}
        >
          {uri}
          {open ? 
            <PiCaretUpBold className="w-4 h-4 text-primary-600" aria-hidden="true" /> : 
            <PiCaretDownBold className="w-4 h-4 text-primary-600" aria-hidden="true" />
          }
        </button>
      </div>
      
      <div 
        id={`${uuid}-content`}
        className={`${open ? 'block' : 'hidden'}`}
      >
        {children}
      </div>
    </div>
  );
} 