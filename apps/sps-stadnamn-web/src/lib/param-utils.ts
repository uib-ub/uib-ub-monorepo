/**
 * Converts a string to base64url format
 * @param str The string to encode
 * @returns The base64url encoded string
 */
export const stringToBase64Url = (str: string): string => {
  if (!str.includes('_')) {
    return str
  }
  const bytes = new TextEncoder().encode(str);
  const base64 = Buffer.from(bytes).toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const base64UrlToString = (base64Url: string): string => {
  if (base64Url.includes('-')) {
    return base64Url
  }
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) base64 += "=";
  const binary = Buffer.from(base64, "base64");
  return new TextDecoder().decode(binary);
};


