export default function () {
  const route = useRoute();
  const router = useRouter();
  const searchInterface = useSearchInterface();
  const myparams = route.query;

  for (const [key, value] of Object.entries(searchOptionsInfo)) {
    let currentVal = searchInterface.value[key];
    let defaultVal: string | null | Array<string>;
    if (searchOptionsInfo[key].q && currentVal !== null) {
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
      }
      else {
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
