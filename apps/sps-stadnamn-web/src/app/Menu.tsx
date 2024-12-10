        <div ref={menuRef} className="xl:hidden !ml-auto flex gap-1 items-center">
import { useState, useRef, useEffect, useContext } from "react";
import { PiCaretLeft, PiList, PiMagnifyingGlass } from 'react-icons/pi';
            }
        <div ref={menuRef} className="xl:hidden !ml-auto flex gap-1 items-center">
            { pathName !== '/' && pathName != '/search' && currentUrl && 
import { GlobalContext } from "./global-provider";
import IconLink from "@/components/ui/icon-link";
                <IconLink href={currentUrl} label="Tilbake til søket"><PiCaretLeft className="text-3xl"/></IconLink>
            }
    const { currentUrl } = useContext(GlobalContext)
