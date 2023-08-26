import { samlingMapping } from "./genSearchAggregateQuery";
import { Samling } from "~/utils/vars-termbase";

export function genTQLangArgument(languages: string[]) {
  if (languages[0] === "all") {
    return [""];
  } else {
    return languages.map((lang) => {
      return `'lang:${lang}'`;
    });
  }
}

export function genTQGraphValue(termbases: (Samling | "all")[]) {
  if (termbases[0] === "all") {
    return ["<urn:x-arq:UnionGraph>"];
  } else {
    return termbases.map((tb) => `ns:${samlingMapping[tb as Samling]}`);
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
