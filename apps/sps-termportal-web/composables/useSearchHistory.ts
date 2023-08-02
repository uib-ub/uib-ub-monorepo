import { StorageSerializers } from "@vueuse/core";
import { SearchInterface } from "./states";

/**
 * Store and load search history in/from local storage.
 *
 * @param searchinterface - state that holds searchterm
 * @returns search history
 */
export default function (searchinterface: Ref<SearchInterface>) {
  const searchHistory = useLocalStorage("appsearchhistory", null, {
    serializer: StorageSerializers.object,
  });

  watchEffect(() => {
    const term = searchinterface.value.term;
    if (!searchHistory.value) {
      if (term) {
        searchHistory.value = [term];
      }
    } else {
      if (searchHistory.value.includes(term)) {
        const index = searchHistory.value.indexOf(term);
        searchHistory.value.splice(index, 1);
      }
      searchHistory.value.unshift(term);
      if (searchHistory.value.length > 20) {
        searchHistory.value.pop();
      }
    }
  });

  return searchHistory;
}
