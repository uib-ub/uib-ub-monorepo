export const getBaseUrl = () => {
  if (process.env.VERCEL_ENV === "production")
    return "https://ub-urls.vercel.app";
  if (process.env.VERCEL_ENV === "preview")
    return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3002";
};

export const API_URL = getBaseUrl()