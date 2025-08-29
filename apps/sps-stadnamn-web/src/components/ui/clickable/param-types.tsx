export type OnlyParams = { only: Record<string, string | null | number>; add?: never; remove?: never };
export type AddParams = { only?: never; add: Record<string, string | null | number>; remove?: string[] };
export type RemoveParams = { only?: never; add?: Record<string, string | null | number>; remove: string[] };


export type BaseParamProps = {
    href?: string;
    children: React.ReactNode;
    link?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    [x: string]: any;
}

export type ParamProps = BaseParamProps & (OnlyParams | AddParams | RemoveParams | { only?: never; add?: never; remove?: never });