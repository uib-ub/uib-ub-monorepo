export function pushSearchEvents(options: SearchOptions) {
  const situation = options.situation;

  // Events
  if (situation === "initial") {
    window._paq.push([
      "trackEvent",
      "search",
      "initial search",
      JSON.stringify({
        term: options.term,
        language: options.language,
        translate: options.translate,
        useDomain: options.useDomain,
        domain: options.domain,
        termbase: options.termbase,
      }),
    ]);
  } else if (situation === "options") {
    window._paq.push([
      "trackEvent",
      "search",
      "options change",
      JSON.stringify({
        term: options.term,
        language: options.language,
        translate: options.translate,
        useDomain: options.useDomain,
        domain: options.domain,
        termbase: options.termbase,
      }),
    ]);
  } else if (situation === "filter") {
    window._paq.push([
      "trackEvent",
      "search",
      "filter change",
      JSON.stringify({
        term: options.term,
        language: options.language,
        translate: options.translate,
        useDomain: options.useDomain,
        domain: options.domain,
        termbase: options.termbase,
        matching: options.matching,
      }),
    ]);
  }
}

export function pushAutocompleteEvents(options: SearchOptions) {
  window._paq.push([
    "trackEvent",
    "autocomplete",
    "search data",
    JSON.stringify({
      term: options.term,
      language: options.language,
      useDomain: options.useDomain,
      domain: options.domain,
      termbase: options.termbase,
    }),
  ]);
}

export function pushDataLangDispEvent(
  dataDisplayLanguages: Array<LangCode>,
  language: LangCode
) {
  const langIndex = dataDisplayLanguages.indexOf(language);
  let change;
  if (langIndex !== -1) {
    change = [language, "rm"];
  } else {
    change = [language, "add"];
  }
  window._paq.push([
    "trackEvent",
    "settings",
    "change data display language",
    JSON.stringify({
      change,
      display: dataDisplayLanguages,
    }),
  ]);
}
