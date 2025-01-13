import { pushAutocompleteEvents } from "~/utils/analyticsEvents";

export default async function (
  searchterm: string,
  termbaseId?: string,
  language?: LangCode
) {
  const data = ref([]);
  if (typeof searchterm === "string") {
    const newOptions: SearchOptions = { term: searchterm };
    if (termbaseId) {
      newOptions.termbase = [termbaseId];
      newOptions.useDomain = false;
    }
    if (language) {
      newOptions.language = [language];
    }

    if (searchterm.trim().length) {
      const options = useGenSearchOptions("autocomplete", newOptions);

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
