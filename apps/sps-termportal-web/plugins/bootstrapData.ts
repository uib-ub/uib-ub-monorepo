export default defineNuxtPlugin((nuxtApp) => {
  /*
  Get subdomains and relations between conceptual domains that are maintained in the CMS.
  */
  const domainData = useDomainData();
  useAsyncData("appConceptualDomains", () =>
    $fetch("/api/bootstrap/domain", {
      headers: process.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
    }).then((data) => {
      for (const domain in domainData.value) {
        // See domain states for predefined topdomains
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

  /*
  Get termbase meta data
  */
  const termbaseData = useTermbaseData();
  useAsyncData("appTermbaseData", () =>
    $fetch("/api/bootstrap/termbase", {
      headers: process.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
    }).then((data) => {
      data.forEach((entry) => {
        const tbLabelLst = entry.page.value.split("-3A");
        const tbLabel = tbLabelLst[tbLabelLst.length - 1];
        if (!termbaseData.value[tbLabel]) {
          termbaseData.value[tbLabel] = {};
        }
        termbaseData.value[tbLabel].language = entry.languages.value.split(",");

        if (entry?.versionInfo) {
          const viSplit = entry?.versionInfo.value.split(";;;");
          termbaseData.value[tbLabel].versionEdition = viSplit[0];
          termbaseData.value[tbLabel].versionNotesLink = viSplit[1];
        }
      });
    })
  );

  /*
  Get localization data from CMS.
  This applies to:
  - termbase names
  - conceptual domain names
  */
  const lazyLocales = useLazyLocales();
  useAsyncData("appLazyLocale", () =>
    $fetch("/api/bootstrap/lazyLocale", {
      headers: process.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
    }).then((data) => {
      data.forEach((entry) => {
        const lang = entry.label["xml:lang"];
        const pagelst = entry.page.value.split("/");
        const page = pagelst[pagelst.length - 1];
        lazyLocales.value[lang][page] = entry.label.value;
      });
    })
  );
});
