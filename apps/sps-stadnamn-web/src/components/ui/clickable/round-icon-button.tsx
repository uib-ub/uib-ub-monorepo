import Link from "next/link";
import IconButton from "../icon-button";
import IconLink from "../icon-link";
import { twMerge } from "tailwind-merge";

const buttonStyling = "rounded-full bg-white text-neutral-900 p-3" + 
    " [box-shadow:0_2px_8px_-1px_rgb(0_0_0_/_0.25),0_1px_3px_-1px_rgb(0_0_0_/_0.35),inset_0_1px_0_rgb(0_0_0_/_0.08)]";


export function RoundIconButton({ children, href, label, className, ...rest }: { children: React.ReactNode, label: string, href?: string, className?: string, [x: string]: any }) {
        if (href) {
            return <IconLink
                href={href}
                className={twMerge(buttonStyling, className)}
                label={label}
                {...rest}
            >
                {children}
            </IconLink>
    }
    return (
        <IconButton
            className={twMerge(buttonStyling, className)}
            label={label}
            {...rest}
        >
            {children}
        </IconButton>
    );
}


export function RoundButton ({ children, className, ...rest }: { children: React.ReactNode, className?: string, [x: string]: any }) {
    return (
        <button
            type="button"
            className={twMerge(buttonStyling, className)}
            {...rest}
        >
            {children}
        </button>
    );
}