export default function () {
  const route = useRoute();
  const router = useRouter();
  const searchOptions = useSearchOptions();
  const searchOpt = searchOptions.value;
  const myparams = route.query;

  for (const [key, value] of Object.entries(searchOptionsInfo)) {
    let defaultVal: string | null;
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

  router.push({
    path: "/search",
    force: true,
    query: myparams,
  });
}
