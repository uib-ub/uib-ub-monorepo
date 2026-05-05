import { PiCaretRightBold } from "react-icons/pi";
import Clickable from "./clickable";
import { ParamProps } from "./param-types";
import { twMerge } from "tailwind-merge";


export default function SubtleLink({ children, className, ...props }: ParamProps) {

    return (
        <Clickable link 
        className={twMerge("inline-flex items-center gap-1 text-sm text-neutral-700 hover:text-neutral-900 no-underline", className)}
        
        {...props}>
        {children}
        <PiCaretRightBold aria-hidden="true"/>
        
        </Clickable>
    )
}