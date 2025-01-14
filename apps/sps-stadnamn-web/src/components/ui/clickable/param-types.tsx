export type OnlyParams = { only: Record<string, string | null>; add?: never; remove?: never };
export type AddParams = { only?: never; add: Record<string, string | null>; remove?: string[] };
export type RemoveParams = { only?: never; add?: Record<string, string | null>; remove: string[] };


export type BaseParamProps = {
    href?: string;
    children: React.ReactNode;
    link?: boolean;
    [x: string]: any;
}

export type ParamProps = BaseParamProps & (OnlyParams | AddParams | RemoveParams);