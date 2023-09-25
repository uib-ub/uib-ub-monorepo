import { defineStore } from "pinia";

export const useSettingsStore = defineStore('settings', {
    state: () => {
        return {
            inflectionExpanded: false,
            inflectionNo: false,
            inflectionTableContext: false,
            listView: false,
            simpleListView: false,
            autoSelect: true,
            perPage: 10
        }
    },
    persist: true,
  })


