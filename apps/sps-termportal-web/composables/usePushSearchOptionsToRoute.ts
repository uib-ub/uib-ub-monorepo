export default function () {
  const route = useRoute();
  const router = useRouter();
  const searchInterface = useSearchInterface();
  const searchOpt = searchInterface.value;
  const myparams = route.query;

  for (const [key, value] of Object.entries(searchOptionsInfo)) {
    let defaultVal: string | null;
    if (searchOptionsInfo[key].q && searchOpt[key] !== null) {
      if (value.default === null) {
        defaultVal = value.default;
      } else {
        defaultVal = value.default.toString();
      }

      if (searchOpt[key].toString() !== defaultVal) {
        myparams[value.q] = searchOpt[key];
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
