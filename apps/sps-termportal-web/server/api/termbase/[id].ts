import genTermbaseQuery from "../../utils/genTermbaseQuery";
import compactData from "../../utils/compactData";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();
  const url = runtimeConfig.public.endpointUrl;

  if (event.context.params) {
    const query = genTermbaseQuery(event.context.params.id);
    const data = await $fetch(url, {
      method: "post",
      body: query,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/ld+json",
      },
    });

    return compactData(data);
  }
});
