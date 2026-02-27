import { twMerge } from "tailwind-merge";
import IconButton from "../icon-button";
import IconLink from "../icon-link";
import Clickable from "./clickable";
import ClickableIcon from "./clickable-icon";
import { TitleBadge } from "../badge";

export const roundButtonStyling = "rounded-full bg-white text-neutral-900 p-2 lg:p-3" +
    " [box-shadow:0_2px_8px_-1px_rgb(0_0_0_/_0.25),0_1px_3px_-1px_rgb(0_0_0_/_0.35),inset_0_1px_0_rgb(0_0_0_/_0.08)]";


export function RoundIconButton({ children, href, label, className, ...rest }: { children: React.ReactNode, label: string, href?: string, className?: string, [x: string]: any }) {
    if (href) {
        return <IconLink
            href={href}
            className={twMerge(roundButtonStyling, className)}
            label={label}
            {...rest}
        >
            {children}
        </IconLink>
    }
    return (
        <IconButton
            className={twMerge(roundButtonStyling, className)}
            label={label}
            {...rest}
        >
            {children}
        </IconButton>
    );
}

export function RoundClickable({ children, onClick, className, ...rest }: { children: React.ReactNode, onClick: () => void, className?: string, [x: string]: any }) {
    return (
        <Clickable
            className={twMerge(roundButtonStyling, className)}
            onClick={onClick}
            {...rest}
        >
            {children}
        </Clickable>
    );
}

export function RoundIconClickable({ children, onClick, className, label, ...rest }: { children: React.ReactNode, onClick?: () => void, className?: string, label: string, [x: string]: any }) {
    return (
        <ClickableIcon
            label={label}
            className={twMerge(roundButtonStyling, className)}
            onClick={onClick}
            {...rest}
        >
            {children}
        </ClickableIcon>
    );
}

export function RoundButton({ children, className, ...rest }: { children: React.ReactNode, className?: string, [x: string]: any }) {
    return (
        <button
            type="button"
            className={twMerge(roundButtonStyling, className)}
            {...rest}
        >
            {children}
        </button>
    );
}

export function RoundIconClickableWithBadge({ children, label, count, isActive, className, ...rest }: { children: React.ReactNode, label: string, count: number, isActive: boolean, className?: string, [x: string]: any }) {
    return (
        <RoundIconClickable label={label} className={className} {...rest}>
            {children}
            {count > 0 && (
                <TitleBadge
                    count={count}
                    className={`text-xs absolute bottom-1.5 right-1.5 ${isActive ? 'bg-white border border-accent-800 text-accent-800' : 'bg-primary-700 text-white'}`}
                />
            )}
        </RoundIconClickable>
    );
}