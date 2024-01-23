/*
Get localization data from CMS.
This applies to:
- termbase names
- conceptual domain names
*/
export default defineNuxtPlugin((nuxtApp) => {
  const lazyLocales = useLazyLocales();

  useAsyncData("appLazyLocale", () =>
    $fetch("/api/lazyLocale", {
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
