import React from 'react'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const checkMembership = (arr: any) => {
  if (arr.every((m: any) => m.active === true)) {
    return false
  }
  if (!arr.every((m: any) => m.active === true) && arr.some((m: any) => m.active === true)) {
    return true
  }
  return false
}

export const uniqueStringArray = (a: string[]) => {
  return [...new Set(a)].filter(Boolean);
}

/**
 * Truncate for string
 * @param {string} str
 * @param {number} n  
 * @param {string} [replacement='...']
 * @returns {string}
 */
export const truncate = (str: string, n: number, replacement = '...') => {
  if (n <= 0) { return ''; }
  return (str.length > n) ? (str.substring(0, n - 1) + replacement) : str;
}

export const path: Record<string, string> = {
  "Actor": "persons",
  "Group": "groups",
  "Project": "projects",
  "Software": "software",
  "VolatileSoftware": "software",
}

/**
 * 
 * @param text 
 * @returns void
 * @example
 * const [isCopied, setIsCopied] = useState(false);
 * 
 * const handleCopyClick = (input: string) => (event: React.MouseEvent<HTMLButtonElement>) => {
 *   // Asynchronously call copyTextToClipboard
 *   copyTextToClipboard(input)
 *     .then(() => {
 *       // If successful, update the isCopied state value
 *       setIsCopied(true);
 *       setTimeout(() => {
 *         setIsCopied(false);
 *       }, 1500);
 *     })
 *     .catch((err) => {
 *       console.log(err);
 *     });
 * }
 * return <Button size={'sm'} variant={'secondary'} onClick={handleCopyClick(data.focusNode.split('/').pop())}>
 *   <CopyIcon className='mr-1' /><span className='block'>{isCopied ? 'id kopiert!' : 'id'}</span>
 * </Button>
 */
export async function copyTextToClipboard(text: string) {
  if ('clipboard' in navigator) {
    return await navigator.clipboard.writeText(text);
  }
}

export const truncateFromMiddle = (
  fullStr: string = '',
  strLen: number = 20,
  middleStr: string = '...',
): string => {
  if (strLen <= 0) { return ''; }
  if (fullStr.length <= strLen) return fullStr;
  const midLen = middleStr.length;
  const charsToShow = strLen - midLen;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    fullStr.substring(0, frontChars) +
    middleStr +
    fullStr.substring(fullStr.length - backChars)
  );
};

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return '';
  const vc = process.env.VERCEL_URL;
  if (vc) return `https://${vc}`;
  return 'http://localhost:3002';
}

/**
 * 
 * @param obj object
 * @param props array of strings
 * @returns object
 */
export function pick<T extends object, K extends keyof T>(obj: T, ...props: K[]): Pick<T, K> {
  return props.reduce(function (result, prop) {
    result[prop] = obj[prop];
    return result;
  }, {} as Pick<T, K>);
}