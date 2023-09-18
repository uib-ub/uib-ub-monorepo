import { defineStore } from "pinia";

export const useSettingsStore = defineStore('settings', {
    state: () => {
        return {
            submitSelect: false,
            inflectionExpanded: false,
            inflectionNo: false,
            inflectionTableContext: false,
            listView: false,
            simpleListView: false,
            autoSelect: false,
            perPage: 10
        }
    },
    persist: true,
  })


