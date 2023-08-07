export default async function (searchterm: string) {
  const data = ref([]);
  if (typeof searchterm === "string") {
    if (searchterm.trim().length) {
      data.value = await $fetch("/api/search/autocomplete", {
        method: "POST",
        body: {
          searchOptions: {
            ...useGenSearchOptions("autocomplete"),
            ...{ term: searchterm },
          },
        },
        retry: 1,
      });
      data.value.unshift(searchterm);
    } else {
      const searchinterface = useSearchInterface();
      const searchhistory = useSearchHistory(searchinterface);
      data.value = [""].concat(searchhistory.value);
    }
  }
  return data.value;
}
