// Some values syncronized with routing in middleware
import { defineStore } from 'pinia'
export const useSessionStore = defineStore('session', {
    state: () => ({
      show_autocomplete: false,
      dropdown_selected: -1,
      concepts_bm: [],
      concepts_nn: [],
      endpoint: undefined,
      copied_link: "",
      error: undefined
    }),
  })