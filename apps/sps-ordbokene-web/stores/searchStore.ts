// Some values syncronized with routing in middleware
import { defineStore } from 'pinia'
export const useStore = defineStore('store', {
    state: () => ({
      q:"",
      input: "",
      originalInput: "",
      selected: {},
      scope: "ei",
      pos: "",
      advanced: false,
      dict: "bm,nn",
      autocompletePending: false,
      autocomplete: [],
      show_autocomplete: false,
      suggest: {},
      suggestQuery: "",
      articles: {},
      searchUrl: null,
      view: null,
      concepts_bm: [],
      concepts_nn: [],
      endpoint: "",
      copied: "",
      focus: null
    }),
  })