"use client";

import { useState } from "react";
import { PiCaretDown, PiCaretUp } from "react-icons/pi";

export default function CollapsibleHeading(props: {
  title: string;
  children: React.ReactNode;
  alwaysOpen?: boolean;
}) {
  const [open, setOpen] = useState(props.alwaysOpen || false);

  return <div className="">
    <h3 className="!mt-0 !py-0"><button className="text-left w-full text-neutral-900 flex items-center gap-1" aria-expanded={open} aria-controls={props.title + '-collapsible'} onClick={() => setOpen(!open)}>
        
        {props.title} {open ? <PiCaretUp className="inline self-center text-primary-600" /> : <PiCaretDown className="inline self-center text-primary-600" />}</button></h3>
        
    <div id={props.title + '-collapsible'} className={`${open ? 'block' : 'hidden'}`}>
        {props.children}
    </div>
  </div>;
}

