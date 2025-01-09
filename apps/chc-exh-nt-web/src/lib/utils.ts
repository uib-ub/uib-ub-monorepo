import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getLabel = (
  labelObj: Record<string, string> | undefined,
  currentLang: string,
  fallbacks = ['no', 'en']
): string => {
  if (!labelObj) return 'Unknown';

  // Create a clean version of the label object without _type
  const cleanLabelObj = Object.fromEntries(
    Object.entries(labelObj)
      .filter(([key]) => key !== '_type')
      .map(([key, value]) => [key, value.trim()])
  );

  // Try current language
  if (cleanLabelObj[currentLang]) return cleanLabelObj[currentLang];

  // Try fallbacks in order
  for (const lang of fallbacks) {
    if (cleanLabelObj[lang]) return cleanLabelObj[lang];
  }

  // Get first available label
  const firstLabel = Object.values(cleanLabelObj)[0];
  return firstLabel || 'Unknown';
}; 