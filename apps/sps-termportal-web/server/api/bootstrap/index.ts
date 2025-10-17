import { parseRelationsRecursively } from "~/server/utils/parseBootstrapData";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";
import { BootstrapData } from "~/types/zod";

export default defineEventHandler(async (_) => {
  const appConfig = useAppConfig();
  const runtimeConfig = useRuntimeConfig();
  const instance = getFusekiInstanceInfo(runtimeConfig);

  const esBootstrapData = await checkEsCache("bootstrap_data");

  try {
    const dataLaLo = esBootstrapData.lalo || (async () => {
      const queryLalo = genLazyLocalesQuery(runtimeConfig.public.base);
      return await $fetch(instance.url, {
        method: "post",
        body: queryLalo,
        headers: {
          "Content-type": "application/sparql-query",
          "Accept": "application/json",
          "Authorization": `Basic ${instance.authHeader}`,
        },
      }).then((data) => {
        const tmp = { nb: {}, nn: {}, en: {} };
        data.results.bindings.forEach((entry) => {
          const lang = entry.label["xml:lang"];
          const page = entry.page.value.split("/").pop();
          tmp[lang][page] = entry.label.value;
        });
        return tmp;
      });
    })();

    const queryTermbase = genTermbaseMetaQuery(runtimeConfig.public.base);
    const dataTermbase = esBootstrapData.termbase || (async () => {
      const queryTermbase = genTermbaseMetaQuery(runtimeConfig.public.base);
      return await $fetch(instance.url, {
        method: "post",
        body: queryTermbase,
        headers: {
          "Content-type": "application/sparql-query",
          "Accept": "application/json",
          "Authorization": `Basic ${instance.authHeader}`,
        },
      }).then((data) => {
        const tmp = {};
        data.results.bindings.forEach((entry) => {
          const tbLabelLst = entry.page.value.split("-3A");
          const tbLabel = tbLabelLst[tbLabelLst.length - 1];
          if (!tmp[tbLabel]) {
            tmp[tbLabel] = {};
          }
          tmp[tbLabel].language
            = entry.languages.value.split(",");

          if (entry?.versionInfo) {
            const viSplit = entry?.versionInfo.value.split(";;;");
            tmp[tbLabel].versionEdition = viSplit[0];
            tmp[tbLabel].versionNotesLink = viSplit[1];
          }
        });
        return tmp;
      });
    });

    await $fetch(instance.url, {
      method: "post",
      body: queryTermbase,
      headers: {
        "Content-type": "application/sparql-query",
        "Accept": "application/json",
        "Authorization": `Basic ${instance.authHeader}`,
      },
    }).then((data) => {
      const tmp = {};
      data.results.bindings.forEach((entry) => {
        const tbLabelLst = entry.page.value.split("-3A");
        const tbLabel = tbLabelLst[tbLabelLst.length - 1];
        if (!tmp[tbLabel]) {
          tmp[tbLabel] = {};
        }
        tmp[tbLabel].language
            = entry.languages.value.split(",");

        if (entry?.versionInfo) {
          const viSplit = entry?.versionInfo.value.split(";;;");
          tmp[tbLabel].versionEdition = viSplit[0];
          tmp[tbLabel].versionNotesLink = viSplit[1];
        }
      });
      return tmp;
    });

    const queryDomain = genDomainQuery(runtimeConfig.public.base);
    const dataDomain = await $fetch(instance.url, {
      method: "post",
      body: queryDomain,
      headers: {
        "Content-type": "application/sparql-query",
        "Accept": "application/ld+json",
        "Authorization": `Basic ${instance.authHeader}`,
      },
    }).then((data) => {
      return frameData(data, "skos:Concept", true);
    }).then((data) => {
      delete data["@context"];
      return identifyData(data["@graph"]);
    }).then((data) => {
      const domainInfo = {};
      for (const domain of appConfig.domain.topdomains) {
        domainInfo[domain] = {};
        domainInfo[domain].subdomains = parseRelationsRecursively(
          data,
          domain,
          "narrower",
          "subdomains",
        );
      }
      return domainInfo;
    });

    const combined = {
      lalo: dataLaLo,
      termbase: dataTermbase,
      domain: dataDomain,
    };

    const parsed = BootstrapData.safeParse(combined);
    if (!parsed.success) {
      console.error("Validation failed:", parsed.error);
      return combined;
    }
    return parsed.data;
  }
  catch (e) {
    console.log(e);
    return {};
  }
});
