export const statusOrder = [
  "kjent",
  "planlagt",
  "initialisert",
  "opprettet",
  "publisert",
];

export const activityTypes = {
  termbaseInitialisering: "Termbase initialisering",
  termbasePublisering: "Termbase publisering",
  termbaseOpprettelse: "Termbase opprettelse",
  termbaseImportering: "Termbase importering",
  møte: "Møte osv."
};

export const studioBaseRoute = "/studio/structure";
export const wikiPageLink = "https://wiki.terminologi.no/index.php?title=";

export const activityColorMapping = {
  2: { color: "#FF6347", description: "i dag eller i går" },
  7: { color: "#FFA500", description: "mindre enn syv dager siden" },
  30: { color: "#FFD700", description: "mindre enn 30 dager siden" },
  1000: { color: "#69b9fe", description: "for mer enn 30 dager siden" },
};
