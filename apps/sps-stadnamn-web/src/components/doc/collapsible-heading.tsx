"use client";

import { useState } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";
import { usePathname } from "next/navigation";
import { useMode } from "@/lib/search-params";
export default function CollapsibleHeading(props: {
  title: string;
  children: React.ReactNode;
  alwaysOpen?: boolean;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}) {
  const pathname = usePathname()
  const mode = useMode()
  // If the route is uuid
  const landingPage = pathname.startsWith('/uuid/')
  const alwaysOpen = props.alwaysOpen !== false && (landingPage || mode != 'map')

  
  const [open, setOpen] = useState(alwaysOpen);
  const HeadingTag = props.headingLevel || 'h3';

  // If not in map mode, render a simple heading with content
  if (alwaysOpen) {
    return (
      <div>
        <HeadingTag className="!mt-0 !py-0">{props.title}</HeadingTag>
        <div className="py-2">{props.children}</div>
      </div>
    );
  }

  return <div className="">
    <HeadingTag className="!mt-0 !py-0"><button className="text-left w-full text-neutral-900 flex items-center gap-1" aria-expanded={open} aria-controls={props.title + '-collapsible'} onClick={() => setOpen(!open)}>
        
        {props.title} {open ? <PiCaretUp className="inline self-center text-primary-600" /> : <PiCaretDown className="inline self-center text-primary-600" />}</button></HeadingTag>
        
    <div id={props.title + '-collapsible'} className={`${open ? 'block py-2' : 'hidden'}`}>
        {props.children}
    </div>
  </div>;
}

