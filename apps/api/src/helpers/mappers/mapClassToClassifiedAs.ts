
export const getBehavior = (type: string): string => {
  return Object.entries(classToAttMapping)
    .find(([_, value]) => value.mapping === type)
    ?.[1]?.behavior?.[0] ?? 'paged'
}

export const classToAttMapping: { [key: string]: { mapping: string, behavior: string[] } } = {
  Document: {
    mapping: "http://vocab.getty.edu/aat/300026030",
    behavior: ["paged"],
  },
  WrittenWork: {
    mapping: "http://vocab.getty.edu/aat/300026030",
    behavior: ["paged"],
  },
  Manuscript: {
    mapping: "http://vocab.getty.edu/aat/300028569",
    behavior: ["paged"],
  },
  Book: {
    mapping: "http://vocab.getty.edu/aat/300028051",
    behavior: ["paged"],
  },
  Proceedings: {
    mapping: "http://vocab.getty.edu/aat/300027316",
    behavior: ["paged"],
  },
  Article: {
    mapping: "http://vocab.getty.edu/aat/300048715",
    behavior: ["paged"],
  },
  AcademicArticle: {
    mapping: "http://vocab.getty.edu/aat/300048715", // General article, Research is http://vocab.getty.edu/aat/300254807
    behavior: ["paged"],
  },
  Bill: {
    mapping: "http://vocab.getty.edu/aat/300027888",
    behavior: ["paged"],
  },
  Booklet: {
    mapping: "http://vocab.getty.edu/aat/300311670",
    behavior: ["paged"],
  },
  CashBook: {
    mapping: "http://vocab.getty.edu/aat/300027493",
    behavior: ["paged"],
  },
  Charter: {
    mapping: "http://vocab.getty.edu/aat/300027621",
    behavior: ["paged"],
  },
  Circulaire: {
    mapping: "http://vocab.getty.edu/aat/300203068",
    behavior: ["paged"],
  },
  Contract: {
    mapping: "http://vocab.getty.edu/aat/300027626",
    behavior: ["paged"],
  },
  Copy: {
    mapping: "http://vocab.getty.edu/aat/300257688",
    behavior: ["paged"],
  },
  Transcription: {
    mapping: "http://vocab.getty.edu/aat/300404333",
    behavior: ["paged"],
  },
  Vidisse: {
    mapping: "http://vocab.getty.edu/aat/300164785", // @TODO: Is this the notarized document or the ledger?
    behavior: ["paged"],
  },
  Deed: {
    mapping: "http://vocab.getty.edu/aat/300027243",
    behavior: ["paged"],
  },
  SaleDeed: {
    mapping: "http://vocab.getty.edu/aat/300027249",
    behavior: ["paged"],
  },
  Diary: {
    mapping: "http://vocab.getty.edu/aat/300027112",
    behavior: ["paged"],
  },
  JourneyLog: {
    mapping: "http://vocab.getty.edu/aat/300027112",
    behavior: ["paged"],
  },
  FinancialStatement: {
    mapping: "http://vocab.getty.edu/aat/300045075",
    behavior: ["paged"],
  },
  Form: {
    mapping: "http://vocab.getty.edu/aat/300049060",
    behavior: ["paged"],
  },
  Fragment: {
    mapping: "http://vocab.getty.edu/aat/300117130",
    behavior: ["individuals"],
  },
  Issue: {
    mapping: "http://vocab.getty.edu/aat/300312349",
    behavior: ["paged"],
  },
  LandSurvey: {
    mapping: "http://vocab.getty.edu/aat/300027257",
    behavior: ["paged"],
  },
  Letter: {
    mapping: "http://vocab.getty.edu/aat/300026879",
    behavior: ["paged"],
  },
  CircularLetter: {
    mapping: "http://vocab.getty.edu/aat/300026882",
    behavior: ["paged"],
  },
  MasterThesis: {
    mapping: "http://vocab.getty.edu/aat/300077723",
    behavior: ["paged"],
  },
  Note: {
    mapping: "http://vocab.getty.edu/aat/300027200",
    behavior: ["paged"],
  },
  Passport: {
    mapping: "http://vocab.getty.edu/aat/300027392",
    behavior: ["paged"],
  },
  PrayerBook: {
    mapping: "http://vocab.getty.edu/aat/300026476",
    behavior: ["paged"],
  },
  Protocol: {
    mapping: "http://vocab.getty.edu/aat/300164785",
    behavior: ["paged"],
  },
  BookOfMinutes: {
    mapping: "http://vocab.getty.edu/aat/300135375",
    behavior: ["paged"],
  },
  CopyBook: {
    mapping: "http://vocab.getty.edu/aat/300115825",
    behavior: ["paged"],
  },
  Receipt: {
    mapping: "http://vocab.getty.edu/aat/300027573",
    behavior: ["paged"],
  },
  Speech: {
    mapping: "http://vocab.getty.edu/aat/300026671",
    behavior: ["paged"],
  },
  Supplication: {
    mapping: "http://vocab.getty.edu/aat/300026030", // TODO: Find a better mapping
    behavior: ["paged"],
  },
  Telegram: {
    mapping: "http://vocab.getty.edu/aat/300026909",
    behavior: ["paged"],
  },
  Ticket: {
    mapping: "http://vocab.getty.edu/aat/300027381",
    behavior: ["individuals"],
  },
  Translation: {
    mapping: "http://vocab.getty.edu/aat/300027389",
    behavior: ["paged"],
  },
  Report: {
    mapping: "http://vocab.getty.edu/aat/300027267",
    behavior: ["paged"],
  },
  ShareCertificate: {
    mapping: "http://vocab.getty.edu/aat/300027558",
    behavior: ["paged"],
  },
  Memorandum: {
    mapping: "http://vocab.getty.edu/aat/300026906",
    behavior: ["paged"],
  },
  Minutes: {
    mapping: "http://vocab.getty.edu/aat/300027440",
    behavior: ["paged"],
  },
  DegreeCertificate: {
    mapping: "http://vocab.getty.edu/aat/300422252",
    behavior: ["paged"],
  },
  BachelorThesis: {
    mapping: "http://vocab.getty.edu/aat/300312343", // @TODO: Associated concepts, FIX
    behavior: ["paged"],
  },
  ShipsLog: {
    mapping: "http://vocab.getty.edu/aat/300027110",
    behavior: ["paged"],
  },
  PressClipping: {
    mapping: "http://vocab.getty.edu/aat/300429554",
    behavior: ["individuals"],
  },
  Brochure: {
    mapping: "http://vocab.getty.edu/aat/300248280",
    behavior: ["paged"],
  },
  Programme: {
    mapping: "http://vocab.getty.edu/aat/300027240",
    behavior: ["paged"],
  },
  Will: {
    mapping: "http://vocab.getty.edu/aat/300027764",
    behavior: ["paged"],
  },
  Bestallingsbrev: {
    mapping: "http://vocab.getty.edu/aat/300026030", // @TODO: Find a better mapping
    behavior: ["paged"],
  },
  DoctoralThesis: {
    mapping: "http://vocab.getty.edu/aat/300312076",
    behavior: ["paged"],
  },
  Flyer: {
    mapping: "http://vocab.getty.edu/aat/300224742",
    behavior: ["individuals"],
  },
  Journal: {
    mapping: "http://vocab.getty.edu/aat/300215390",
    behavior: ["paged"],
  },
  MortageDeed: {
    mapping: "http://vocab.getty.edu/aat/300027251",
    behavior: ["paged"],
  },
  EditedBook: {
    mapping: "http://vocab.getty.edu/aat/300026030", // @TODO: Find a better mapping
    behavior: ["paged"],
  },
  Thesis: {
    mapping: "http://vocab.getty.edu/aat/300028028",
    behavior: ["paged"],
  },
  Album: {
    mapping: "http://vocab.getty.edu/aat/300026695",
    behavior: ["paged"],
  },
  MapSet: {
    mapping: "http://vocab.getty.edu/aat/300026030", // @TODO: Find a better mapping
    behavior: ["individuals"],
  },
  Attachment: {
    mapping: "http://vocab.getty.edu/aat/300234049",
    behavior: ["individuals"],
  },
  ExLibris: {
    mapping: "http://vocab.getty.edu/aat/300028731",
    behavior: ["individuals"],
  },
  Sigil: {
    mapping: "http://vocab.getty.edu/aat/300417667", // Same as Seal, as AAT does not have pendant or applied seal
    behavior: ["individuals"],
  },
  Mark: {
    mapping: "http://vocab.getty.edu/aat/300028744",
    behavior: ["individuals"],
  },
  Seal: {
    mapping: "http://vocab.getty.edu/aat/300417667", // Same as Sigil, as AAT does not have pendant or applied seal
    behavior: ["individuals"],
  },
  Image: {
    mapping: "http://vocab.getty.edu/aat/300264387",
    behavior: ["individuals"],
  },
  Photograph: {
    mapping: "http://vocab.getty.edu/aat/300046300",
    behavior: ["individuals"],
  },
  Drawing: {
    mapping: "http://vocab.getty.edu/aat/300033973",
    behavior: ["individuals"],
  },
  GraphicArt: {
    mapping: "http://vocab.getty.edu/aat/300033973",
    behavior: ["individuals"],
    /* 
    GraphicArt i AAT er det en prosess, og jeg vet ikke om vi har fulgt "depend upon line and not color" i praksis. Så vi mapper til Drawing.
    Note: Processes and techniques for making images using the arts of printmaking, illustration, drawing, and other techniques that depend upon line and not color to render the design. In historical usage, the term referred more broadly to presentation in two-dimensional visual form, including most arts on paper, panel, or canvas, including painting.
    */
  },
  LivingImage: {
    mapping: "http://vocab.getty.edu/aat/300136900",
    behavior: ["individuals"],
  },
  Map: {
    mapping: "http://vocab.getty.edu/aat/300028094",
    behavior: ["individuals"],
  },
  Painting: {
    mapping: "http://vocab.getty.edu/aat/300033618",
    behavior: ["individuals"],
  },
  Postcard: {
    mapping: "http://vocab.getty.edu/aat/300026816",
    behavior: ["paged"],
  },
  Poster: {
    mapping: "http://vocab.getty.edu/aat/300027221",
    behavior: ["individuals"],
  },
  Advertisement: {
    mapping: "http://vocab.getty.edu/aat/300193993",
    behavior: ["individuals"],
  },
  CatalogueCard: {
    mapping: "http://vocab.getty.edu/aat/300026769",
    behavior: ["individuals"],
  },
}