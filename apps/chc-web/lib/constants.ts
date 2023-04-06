export const getApiBaseUrl = () => {
  if (process.env.VERCEL_ENV === "production")
    return `https://api-ub.vercel.app`;
  if (process.env.VERCEL_ENV === "preview")
    return `https://api-ub.vercel.app`;
  return "http://localhost:3009";
};

export const API_URL = getApiBaseUrl()