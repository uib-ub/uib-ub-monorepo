import type { TermbaseId } from "~/utils/vars-termbase";

export function genTQLangArgument(languages: string[]) {
  if (languages[0] === "all") {
    return [""];
  } else {
    return languages.map((lang) => {
      return `'lang:${lang}'`;
    });
  }
}

export function genTQGraphValue(termbases: (TermbaseId | "all")[]) {
  if (termbases[0] === "all") {
    return ["<urn:x-arq:UnionGraph>"];
  } else {
    return termbases.map((tb) => `ns:${tb}`);
  }
}

export function genDomainTriple(domains: string[]) {
  if (domains[0] !== "all") {
    const domainsVal = domains
      .map((d) => {
        return "base:" + d;
      })
      .join("|");
    return `?c skosxl:prefLabel|skosxl:altLabel|skosxl:hiddenLabel ?l .
# ?c skosp:domene|skosp:domeneTransitive ${domainsVal} .`;
  } else {
    return "";
  }
}

export function decodeSearchOptions(options: any) {
  const newOptions = {
    type: options.type || "",
    subtype: options.subtype || "",
    situation: options.situation || "",
    term: options.term,
    language: options.language.split(","),
    translate: options.translate || "",
    termbase: options.termbase ? options.termbase.split(",") : [],
    domain: options.domain ? options.domain.split(",") : [],
    useDomain: options.useDomain === "true",
    predicate: options.predicate ? options.predicate.split(",") : [],
    matching: options.matching ? options.matching.split(",") : [], // substructure lost
    limit: options.limit ? Number(options.limit) : 0,
    offset:
      options.offset || options.offset === "undefined"
        ? undefined
        : Number(options.offset),
  };
  return newOptions;
}
