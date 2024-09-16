import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Repeat search params instead of comma separated values
// If searchparam contains array: amd=Hello&adm=World => [["adm", "hello"], ["adm", "world"]] instead of {adm: ["hello", "world"]}
export function repeatingSearchParams(searchParams: Record<string, string | string[]>): URLSearchParams {
  return new URLSearchParams(Object.entries(searchParams).flatMap(([key, values]) => 
    Array.isArray(values) ? values.map(value => [key, value]) : [[key, values]]
  ))
}


export function getValueByPath (obj: any, path: string | undefined): any {
  if (!path) {
    return ""
  }

  // Needed for nested fields in both field and _source
  if (path.split("__").length == 2) {
    // Concatenate gnr of all cadastre
    const [nestedField, field] = path.split('__')

    return obj[nestedField]?.map((cad: any) => cad[field]).join(', ')
    
  }

  // No reduce needed if field instead of _source
  return obj[path] || path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
