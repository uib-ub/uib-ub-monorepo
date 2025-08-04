import genTermbaseQuery from "../../../utils/genTermbaseQuery";
import frameData from "../../../utils/frameData";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";

export default defineEventHandler(async (event) => {
  if (event.context.params) {
    const runtimeConfig = useRuntimeConfig();

    const query = genTermbaseQuery(event.context.params.id);
    const instance = getFusekiInstanceInfo(runtimeConfig);

    const data = await $fetch(instance.url, {
      method: "post",
      body: query,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/ld+json",
        Authorization: `Basic ${instance.authHeader}`,
      },
    });

    return frameData(data, "skos:Collection").then((value) => {
      delete value["@context"];
      return value;
    });
  }
});
