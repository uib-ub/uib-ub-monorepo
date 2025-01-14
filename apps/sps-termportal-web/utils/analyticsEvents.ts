/**
 * Pushes search event based on trigger situation to matomo.
 *
 * @param options - Currently active search options
 *
 */
export function pushSearchEvents(options: SearchOptions): void {
  const situation = options.situation;

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

/**
 * Pushes autocomplete event for searchbar to matomo.
 *
 * @param options - Currently active search options
 */
export function pushAutocompleteEvents(options: SearchOptions): void {
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

/**
 * Pushes settings event to for display language change to matomo
 *
 * @param dataDisplayLanguages - Array of currently active data display languages
 * @param language - Language code of changed language
 */
export function pushDataLangDispEvent(
  dataDisplayLanguages: Array<LangCode>,
  language: LangCode
): void {
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

/**
 * Pushes feature event for initial search from termbase page to matomo.
 * Events are a subset of the initial search events.
 *
 * @param termbase - Identifier of the termbase from which the search is initiated.
 */ export function pushTermbaseSearchEvent(termbase: string): void {
  window._paq.push([
    "trackEvent",
    "feature",
    "inital search from termbase",
    termbase,
  ]);
}

/**
 * Pushes navigation event for termbase page concept list navigation to matomo.
 *
 * @param termbase - Visited termbase page ID
 * @param type - type of navigation
 * @param value - actual char or page number
 */
export function pushTermbaseConceptListNavigationEvent(
  termbase: string,
  type: "char" | "page",
  value: Record<string, any>
): void {
  window._paq.push([
    "trackEvent",
    "navigation",
    "termbase concept list navigation",
    JSON.stringify({
      termbase,
      type,
      value,
    }),
  ]);
}

/**
 * Pushes navigation event to track a visit of a termpost from the termbase concept list.
 *
 * @param termbase - Identifier for the termbase being visited.
 * @param termpost - Identifier for the termpost within the termbase.
 */
export function pushTermbaseConceptListVisitEvent(
  termbase: string,
  termpost: string
): void {
  window._paq.push([
    "trackEvent",
    "navigation",
    "termbase concept list termpost visit",
    JSON.stringify({
      termbase,
      termpost,
    }),
  ]);
}
