import genTermbaseQuery from "../../../utils/genTermbaseQuery";
import frameData from "../../../utils/frameData";
import { getFusekiInstanceInfo } from "~/server/utils/fusekiUtils";
import { Termbase } from "~/types/zod";

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
        Accept: "application/ld+json",
        Authorization: `Basic ${instance.authHeader}`,
      },
    });

    return frameData(data, "skos:Collection").then((value) => {
      delete value["@context"];
      const parsed = Termbase.safeParse(value);
      if (!parsed.success) {
        console.error("Validation failed:", parsed.error);
        return value;
      }
      return parsed.data;
    });
  }
});
