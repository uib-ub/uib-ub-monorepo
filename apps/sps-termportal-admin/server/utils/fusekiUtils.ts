import type { RuntimeConfig } from "nuxt/schema";

export function getFusekiInstanceInfo(
  config: RuntimeConfig,
  instance: "default" | "internal"
) {
  const { url, user, pass } = config.fuseki[instance];
  const credentials = `${user}:${pass}`;
  const authHeader = Buffer.from(credentials).toString("base64");

  return {
    url,
    authHeader,
  };
}
