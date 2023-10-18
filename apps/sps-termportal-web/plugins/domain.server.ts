/*
Get subdomains and relations between conceptual domains that are maintained in the CMS.
*/

export default defineNuxtPlugin((nuxtApp) => {
  const domainData = useDomainData();

  useAsyncData("appConceptualDomains", () =>
    $fetch("/api/domain", {
      headers: process.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
    }).then((data) => {
      for (const domain in domainData.value) {
        // allow deactivation of topdomains on frontend that are defined in the CMS. See domain states
        try {
          domainData.value[domain].subdomains = parseRelationsRecursively(
            data,
            domain,
            "narrower",
            "subdomains"
          );
        } catch (entry) {}
      }
    })
  );
});
