import { useSearchParams } from 'next/navigation'

export function useQueryWithout(omit : string[]) {
    const params = useSearchParams()
    const paramsArray = Array.from(params.entries());
    return  paramsArray.filter(([key]) => !omit.includes(key));

}

export function useQueryStringWithout(omit : string[]) {
    return new URLSearchParams(useQueryWithout(omit)).toString();

}