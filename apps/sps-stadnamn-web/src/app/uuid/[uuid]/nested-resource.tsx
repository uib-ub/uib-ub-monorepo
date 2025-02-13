"use client";

import { useState, useEffect } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface NestedResourceProps {
  uri: string;
  children: React.ReactNode;
  parentUuid?: string;
  childUuids?: string[];
}

export default function NestedResource({ uri, children, parentUuid, childUuids = [] }: NestedResourceProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Extract UUID from URI if it's prefixed
  const getUuid = (uri: string): string => {
    if (uri.includes(':')) {
      const [, uuid] = uri.split(':');
      return uuid;
    }
    return uri;
  };

  // Check URL fragment on mount and when hash changes
  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== 'undefined') {
        const fragment = window.location.hash.slice(1) || '';
        const uuid = getUuid(uri);
        
        // Expand if fragment matches uuid OR if fragment matches any child UUID
        if (fragment === uuid || childUuids.includes(fragment)) {
          setOpen(true);
        }
      }
    };

    // Check hash on mount
    checkHash();

    // Add hash change listener
    window.addEventListener('hashchange', checkHash);

    // Clean up listener
    return () => window.removeEventListener('hashchange', checkHash);
  }, [uri, childUuids]);

  const uuid = getUuid(uri);
  const routeUuid = pathname.split('/').pop();
  const parentUrl = parentUuid ? 
    (parentUuid === routeUuid ? pathname : `${pathname}#${parentUuid}`) : 
    pathname;
  const href = `${pathname}#${uuid}`;

  return (
    <div className="space-y-2">
      HERE{parentUuid}STOP
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
            <PiCaretUp className="w-4 h-4 text-primary-600" aria-hidden="true" /> : 
            <PiCaretDown className="w-4 h-4 text-primary-600" aria-hidden="true" />
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