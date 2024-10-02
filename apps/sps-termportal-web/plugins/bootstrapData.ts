import { useBootstrapData } from "~/composables/states";

export default defineNuxtPlugin((nuxtApp) => {
  /*
  Get labels, data and relations that are maintained in the CMS.
  */
  const bootstrapData = useBootstrapData();
  const data = useAsyncData("appConceptualDomains", () =>
    $fetch("/api/bootstrap", {
      headers: process.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
    }).then((data) => {
      // lazy locales
      try {
        data.lalo.forEach((entry) => {
          const lang = entry.label["xml:lang"];
          const pagelst = entry.page.value.split("/");
          const page = pagelst[pagelst.length - 1];
          bootstrapData.value.lalo[lang][page] = entry.label.value;
        });
      } catch (error) {}

      // domain
      try {
        for (const domain in bootstrapData.value.domain) {
          bootstrapData.value.domain[domain].subdomains =
            parseRelationsRecursively(
              data.domain,
              domain,
              "narrower",
              "subdomains"
            );
        }
      } catch (error) {}

      // termbase meta
      try {
        data.termbase.forEach((entry) => {
          const tbLabelLst = entry.page.value.split("-3A");
          const tbLabel = tbLabelLst[tbLabelLst.length - 1];
          if (!bootstrapData.value.termbase[tbLabel]) {
            bootstrapData.value.termbase[tbLabel] = {};
          }
          bootstrapData.value.termbase[tbLabel].language =
            entry.languages.value.split(",");

          if (entry?.versionInfo) {
            const viSplit = entry?.versionInfo.value.split(";;;");
            bootstrapData.value.termbase[tbLabel].versionEdition = viSplit[0];
            bootstrapData.value.termbase[tbLabel].versionNotesLink = viSplit[1];
          }
        });
      } catch (error) {}

      bootstrapData.value.loaded = true;
    })
  );
});
