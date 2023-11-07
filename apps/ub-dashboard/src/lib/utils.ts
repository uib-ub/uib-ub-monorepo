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
  return [...new Set(a)];
}

/**
 * Truncate for string
 * @param {string} str
 * @param {number} n  
 * @param {string} [replacement='...']
 * @returns {string}
 */
export const truncate = (str: string, n: number, replacement = '...') => {
  return (str.length > n) ? str.substr(0, n - 1) + replacement : str;
}

export const path: Record<string, string> = {
  "Actor": "persons",
  "Group": "groups",
  "Project": "projects",
  "Software": "software",
}
