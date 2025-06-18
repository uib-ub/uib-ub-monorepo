import { treeSettings } from "@/config/server-config"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Base64UrlEncoder, Base64UrlDecoder } from 'next-base64-encoder'
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
      return `${Math.round(num / 1000000)}M`;
  }
  if (num >= 1000) {
      return `${Math.round(num / 1000)}k`;
  }
  return num.toString();
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

  
  if (obj[path]) {
    return obj[path]
  }
  else if (path == "adm") {
    return [obj.adm1, obj.adm2, obj.adm3].filter(Boolean).join('__')
  }
  else {
    // Needed for nested fields in both field and _source
  if (path.split("__").length == 2) {
    // Concatenate gnr of all cadastre
    const [nestedField, field] = path.split('__')

    return obj[nestedField]?.map((cad: any) => cad[field]).join(', ')
    
  }

  // No reduce needed if field instead of _source
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);

  }

  

  
}


// 20 random numbers between 1 and 16, not ordered by size

const baseSkeletonLengths = [4, 1, 13, 11, 8, 3, 15, 6, 10, 2, 14, 9, 7, 12, 5, 16, 2, 8, 4, 11];
export function getSkeletonLength(index: number, min: number, max: number): number {
  // Use modulo to wrap the index if it's larger than the list length
  const wrappedIndex = index % baseSkeletonLengths.length;

  return Math.floor(baseSkeletonLengths[wrappedIndex] * (max - min) / 16 + min);
}


export function getFieldValue(hit: any, field: string) {
  // If we have a hit with fields, use that
  if (hit.fields?.[field]) {
    return hit.fields[field];
  }
  
  // If we have a hit with _source, use getValueByPath on the _source
  if (hit._source) {
    const sourceValue = hit._source[field] || getValueByPath(hit._source, field);
    return sourceValue ? (Array.isArray(sourceValue) ? sourceValue : [sourceValue]) : null;
  }
  
  // Otherwise treat the hit itself as the source object
  const sourceValue = hit[field] || getValueByPath(hit, field);
  return sourceValue ? (Array.isArray(sourceValue) ? sourceValue : [sourceValue]) : null;
}

export function getGnr(hit: any, dataset: string) {
  const data = hit?._source || hit?.fields
  if (!treeSettings[dataset] || !data) {
    return null
  }
  const gnr = getFieldValue(hit, treeSettings[dataset]?.subunit) || data?.cadastre?.[0]?.gnr
  if (Array.isArray(gnr)) {
    return gnr.join(",")
  }
  return gnr
}

export function getBnr(hit: any, dataset: string) {
  const data = hit?._source || hit?.fields
  if (!treeSettings[dataset] || !data) {
      return null
    }
  const bnr = getFieldValue(hit, treeSettings[dataset]?.leaf) || data?.cadastre?.[0]?.bnr
  if (Array.isArray(bnr)) {
    return bnr.join(",")
  }
  return bnr
}


export const trimResultData = (resultData: any[], totalHits: number) => {
  // Trim all elements at the end that have the same gnidu as the last element
  const lastResult = resultData[resultData.length - 1]?.["fields"]
  const firstResult = resultData[0]?.["fields"]
  if (resultData.length == totalHits || !lastResult || !firstResult) {
      return resultData
  }

  if (lastResult.label == firstResult.label) {
      if (lastResult.gnidu && firstResult.gnidu && lastResult.gnidu[0] == firstResult.gnidu[0]) {
          return resultData
      }
  }
  let trimIndex = resultData.length;

  for (let i = resultData.length - 1; i >= 0; i--) {
      if (resultData[i]["fields"]?.label?.[0] !== lastResult?.label?.[0]) {
          break;
      }

      if ((resultData[i]["fields"].gnidu && lastResult.gnidu && resultData[i]["fields"].gnidu[0] !== lastResult.gnidu[0]) || (resultData[i]["fields"].h3 && lastResult.h3 && resultData[i]["fields"].h3[0] !== lastResult.h3[0])) {
          break;
      }
      trimIndex = i -1;
  }
  const trimmedResultData = resultData.slice(0, trimIndex);

  return trimmedResultData?.length > 0 ? trimmedResultData : resultData
}



/**
 * Converts a string to base64url format
 * @param str The string to encode
 * @returns The base64url encoded string
 */
export const stringToBase64Url = (str: string): string => {
  // First convert string to binary array
  const byteArray = new TextEncoder().encode(str);
  // Then use Base64UrlDecoder to convert binary array to base64url string
  const base64UrlDecoder = new Base64UrlDecoder();
  return base64UrlDecoder.decode(byteArray);
}

/**
 * Converts a base64url string back to its original string
 * @param base64Url The base64url encoded string
 * @returns The decoded string
 */
export const base64UrlToString = (base64Url: string): string => {
  // First use Base64UrlEncoder to convert base64url string to binary array
  const base64UrlEncoder = new Base64UrlEncoder();
  const byteArray = base64UrlEncoder.encode(base64Url);
  // Then convert binary array back to string
  return new TextDecoder().decode(byteArray);
}
  
