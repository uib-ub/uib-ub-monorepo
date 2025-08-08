export default function () {
  const appConfig = useAppConfig();
  const searchOptionsConfig = appConfig.search.options;

  const route = useRoute();
  const router = useRouter();
  const searchInterface = useSearchInterface();
  const myparams = route.query;

  for (const [key, value] of Object.entries(searchOptionsConfig)) {
    let currentVal = searchInterface.value[key];
    let defaultVal: string | null | Array<string>;
    if (searchOptionsConfig[key].q && currentVal !== null) {
      if (value.default === null) {
        defaultVal = value.default;
      } else if (
        typeof value.default === "string" ||
        typeof value.default === "boolean"
      ) {
        currentVal = currentVal.toString();
        defaultVal = value.default.toString();
      } else if (Array.isArray(value.default)) {
        currentVal = currentVal.toString();
        defaultVal = value.default.join(",");
      } else {
        currentVal = JSON.stringify(currentVal);
        defaultVal = JSON.stringify(value.default);
      }

      if (currentVal !== defaultVal) {
        myparams[value.q] = currentVal;
      } else {
        myparams[value.q] = undefined;
      }
    }
  }
  router.push({
    path: "/search",
    force: true,
    query: myparams,
  });
}
