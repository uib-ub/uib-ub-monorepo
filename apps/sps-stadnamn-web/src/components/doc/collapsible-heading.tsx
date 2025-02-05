"use client";

import { useState } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";

export default function CollapsibleHeading(props: {
  title: string;
  children: React.ReactNode;
  alwaysOpen?: boolean;
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}) {
  const [open, setOpen] = useState(props.alwaysOpen || false);
  const HeadingTag = props.headingLevel || 'h3';

  return <div className="">
    <HeadingTag className="!mt-0 !py-0"><button className="text-left w-full text-neutral-900 flex items-center gap-1" aria-expanded={open} aria-controls={props.title + '-collapsible'} onClick={() => setOpen(!open)}>
        
        {props.title} {open ? <PiCaretUp className="inline self-center text-primary-600" /> : <PiCaretDown className="inline self-center text-primary-600" />}</button></HeadingTag>
        
    <div id={props.title + '-collapsible'} className={`${open ? 'block' : 'hidden'}`}>
        {props.children}
    </div>
  </div>;
}

