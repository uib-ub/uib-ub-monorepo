import { useSearchParams } from 'next/navigation'

export function queryWithout(omit : string[]) {
    const params = useSearchParams()
    const paramsArray = Array.from(params.entries());
    return  paramsArray.filter(([key]) => !omit.includes(key));

}

export function queryStringWithout(omit : string[]) {
    return new URLSearchParams(queryWithout(omit)).toString();

}