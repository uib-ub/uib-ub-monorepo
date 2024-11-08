export const statusOrder = [
  "kjent",
  "planlagt",
  "initialisert",
  "opprettet",
  "publisert",
];

export const activityTypes = {
  termbaseInitialisering: "Termbase initialisering",
  termbaseOpprettelse: "Termbase opprettelse",
  termbaseImportering: "Termbase importering",
  termbasePublisering: "Termbase publisering",
  termbaseStatusReport: "Termbase statusrapport",
  termgruppeOppdatering: "Termgruppe medlemsoppdatering",
  møte: "Møte osv.",
};

export const studioBaseRoute = "/studio/structure";
export const wikiPageLink = "https://wiki.terminologi.no/index.php?title=";

export const colorMappingStatus = {
  error: { color: "text-red-500" },
  warning: { color: "text-amber-400" },
  ok: { color: "text-green-600" },
};

export const colorMappingFreshness = {
  2: { color: "text-green-400", description: "i dag eller i går" },
  7: { color: "text-teal-300", description: "mindre enn syv dager siden" },
  30: { color: "text-tpblue-200", description: "mindre enn 30 dager siden" },
  1000: { color: "text-tpblue-100", description: "for mer enn 30 dager siden" },
};

export const topDomains = {
  NaturvitenskapTeknologi: "Naturvitenskap og teknologi",
  Humaniora: "Humaniora",
  Samfunnsfag: "Samfunnsfag",
  OkonomiAdministrasjon: "Okonomi og Administrasjon",
  Helse_og_sosial: "Helse og sosial",
  Kunst_design_arkitektur: "Kunst, design og arkitektur",
  Lærerutdanning: "Lærerutdanning",
};

export const orderTopDomain = [
  "NaturvitenskapTeknologi",
  "Humaniora",
  "Samfunnsfag",
  "OkonomiAdministrasjon",
  "Helse_og_sosial",
  "Kunst_design_arkitektur",
  "Lærerutdanning",
];

export const studioLinks = {
  newActivity: "/studio/intent/create/template=activity;type=activity/",
};

export const esCachedQueries = [
  "termbase_overview",
  "termbase_language_coverage",
  "domain_overview",
  "topdomain_language_coverage",
  "topdomain_ssb_language_coverage",
  "domain_language_coverage",
];

export const reportReminder = {
  interval: { reminder: 120, error: 60 },
};

export const hiddenCollections = ["DOMENE", "LISENS", "MRT2"];
