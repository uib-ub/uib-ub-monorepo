import genTermbaseQuery from "../../../utils/genTermbaseQuery";
import frameData from "../../../utils/frameData";

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig();

  const url = runtimeConfig.endpointUrl;
  const credentials = `termportalen_test_read:${runtimeConfig.endpointUrlPass}`;
  const authHeader = Buffer.from(credentials).toString("base64");

  if (event.context.params) {
    const query = genTermbaseQuery(event.context.params.id);

    const data = await $fetch(url, {
      method: "post",
      body: query,
      headers: {
        "Content-type": "application/sparql-query",
        Referer: "termportalen.no", // TODO Referer problem
        Accept: "application/ld+json",
        Authorization: `Basic ${authHeader}`,
      },
    });

    return frameData(data, "skos:Collection").then((value) => {
      delete value["@context"];
      return value;
    });
  }
});
