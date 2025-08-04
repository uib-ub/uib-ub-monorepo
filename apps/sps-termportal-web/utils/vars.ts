export const searchOptionsInfo = {
  type: { default: "search" },
  subtype: { default: "" },
  situation: { default: "" },
  term: { q: "q", default: null },
  language: { q: "ss", default: "all" },
  translate: { q: "ms", default: "none" },
  termbase: { q: "tb", default: [] },
  domain: { q: "d", default: {} },
  useDomain: { q: "ud", default: true },
  predicate: { default: ["prefLabel", "altLabel", "hiddenLabel"] },
  matching: {
    default: [
      ["full-cs", "full-ci"],
      ["startsWith-ci"],
      ["endsWith-ci"],
      ["subWord-ci"],
      ["contains-ci"],
    ],
  },
  limit: { default: 30 },
  offset: { default: undefined },
};

// TODO get url fro wiki
export const licenseLinks = {
  "LISENS-3ANo_Rights_Reserved_-28CC0-29":
    "https://creativecommons.org/publicdomain/zero/1.0/legalcode",
  "LISENS-3ACC_BY_40":
    "https://creativecommons.org/licenses/by/4.0/legalcode.no",
  "LISENS-3ACC_BY-2DSA_40":
    "https://creativecommons.org/licenses/by-sa/4.0/legalcode.no",
  "LISENS-3ACC_BY-2DND_40":
    "https://creativecommons.org/licenses/by-nd/4.0/legalcode.no",
  "LISENS-3ACC_BY-2DNC_40":
    "https://creativecommons.org/licenses/by-nc/4.0/legalcode.no",
  "LISENS-3ACC_BY-2DNC-2DND_40":
    "https://creativecommons.org/licenses/by-nc-nd/4.0/legalcode.no",
  "LISENS-3ACC_BY-2DNC-2DSA_40":
    "https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode.no",
  "LISENS-3AClarin_ID-2DEDU-2DBY-2DNC-2DNORED":
    "https://urn.fi/urn:nbn:fi:lb-2019071724",
};
