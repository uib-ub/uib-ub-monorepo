import { pushAutocompleteEvents } from "~/utils/analyticsEvents";

export default async function (searchterm: string) {
  const data = ref([]);
  if (typeof searchterm === "string") {
    if (searchterm.trim().length) {
      const options = useGenSearchOptions("autocomplete", {
        term: searchterm,
      });

      pushAutocompleteEvents(options);
      const params = new URLSearchParams(options).toString();

      data.value = await $fetch(`/api/search/autocomplete?${params}`, {
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
