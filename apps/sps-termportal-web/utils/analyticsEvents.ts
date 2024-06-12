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
