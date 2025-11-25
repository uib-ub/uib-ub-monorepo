import { useBootstrapData } from "~/composables/states";

export default defineNuxtPlugin(async (_) => {
  /*
  Get labels, data and relations that are maintained in the CMS.
  */
  const bootstrapData = useBootstrapData();

  const { data } = await useAsyncData("fetchBoostrapData", () =>
    $fetch<BootstrapData>("/api/bootstrap", {
      headers: import.meta.server
        ? { cookie: "session=" + useRuntimeConfig().apiKey }
        : undefined,
      retry: 1,
    }));

  if (data.value) {
    bootstrapData.value = data.value;
  }
});
