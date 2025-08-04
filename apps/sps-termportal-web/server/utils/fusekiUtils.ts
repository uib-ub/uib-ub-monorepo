export function getFusekiInstanceInfo() {
  const { fuseki } = useRuntimeConfig();
  const credentials = `${fuseki.user}:${fuseki.pass}`;
  const authHeader = Buffer.from(credentials).toString("base64");

  return {
    url: fuseki.url,
    authHeader,
  };
}
