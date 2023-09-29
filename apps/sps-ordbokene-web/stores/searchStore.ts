// Some values syncronized with routing in middleware
import { defineStore } from 'pinia'
export const useSearchStore = defineStore('store', {
    state: () => ({
      q:"",
      input: "",
      selected: {},
      scope: "ei",
      pos: "",
      dict: "bm,nn",
      autocomplete: [],
      lemmas: {bm: new Set(), nn: new Set()},
      suggest: {},
      suggestQuery: "",
      articles: {},
      searchUrl: null,
      concepts_bm: [],
      concepts_nn: [],
    }),
  })