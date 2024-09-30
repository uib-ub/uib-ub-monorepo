export const classToAttMapping: { [key: string]: { mapping: string, behavior: string[] } } = {
  Document: {
    mapping: "https://vocab.getty.edu/aat/300026030",
    behavior: ["paged"],
  },
  WrittenWork: {
    mapping: "https://vocab.getty.edu/aat/300026030",
    behavior: ["paged"],
  },
  Manuscript: {
    mapping: "https://vocab.getty.edu/aat/300028569",
    behavior: ["paged"],
  },
  Book: {
    mapping: "https://vocab.getty.edu/aat/300028051",
    behavior: ["paged"],
  },
  Proceedings: {
    mapping: "https://vocab.getty.edu/aat/300027316",
    behavior: ["paged"],
  },
  Article: {
    mapping: "https://vocab.getty.edu/aat/300048715",
    behavior: ["paged"],
  },
  AcademicArticle: {
    mapping: "https://vocab.getty.edu/aat/300048715", // General article, Research is https://vocab.getty.edu/aat/300254807
    behavior: ["paged"],
  },
  Bill: {
    mapping: "https://vocab.getty.edu/aat/300027888",
    behavior: ["paged"],
  },
  Booklet: {
    mapping: "https://vocab.getty.edu/aat/300311670",
    behavior: ["paged"],
  },
  CashBook: {
    mapping: "https://vocab.getty.edu/aat/300027493",
    behavior: ["paged"],
  },
  Charter: {
    mapping: "https://vocab.getty.edu/aat/300027621",
    behavior: ["paged"],
  },
  Circulaire: {
    mapping: "https://vocab.getty.edu/aat/300203068",
    behavior: ["paged"],
  },
  Contract: {
    mapping: "https://vocab.getty.edu/aat/300027626",
    behavior: ["paged"],
  },
  Copy: {
    mapping: "https://vocab.getty.edu/aat/300257688",
    behavior: ["paged"],
  },
  Transcription: {
    mapping: "https://vocab.getty.edu/aat/300404333",
    behavior: ["paged"],
  },
  Vidisse: {
    mapping: "https://vocab.getty.edu/aat/300164785", // @TODO: Is this the notarized document or the ledger?
    behavior: ["paged"],
  },
  Deed: {
    mapping: "https://vocab.getty.edu/aat/300027243",
    behavior: ["paged"],
  },
  SaleDeed: {
    mapping: "https://vocab.getty.edu/aat/300027249",
    behavior: ["paged"],
  },
  Diary: {
    mapping: "https://vocab.getty.edu/aat/300027112",
    behavior: ["paged"],
  },
  JourneyLog: {
    mapping: "https://vocab.getty.edu/aat/300027112",
    behavior: ["paged"],
  },
  FinancialStatement: {
    mapping: "https://vocab.getty.edu/aat/300045075",
    behavior: ["paged"],
  },
  Form: {
    mapping: "https://vocab.getty.edu/aat/300049060",
    behavior: ["paged"],
  },
  Fragment: {
    mapping: "https://vocab.getty.edu/aat/300117130",
    behavior: ["individuals"],
  },
  Issue: {
    mapping: "https://vocab.getty.edu/aat/300312349",
    behavior: ["paged"],
  },
  LandSurvey: {
    mapping: "https://vocab.getty.edu/aat/300027257",
    behavior: ["paged"],
  },
  Letter: {
    mapping: "https://vocab.getty.edu/aat/300026879",
    behavior: ["paged"],
  },
  CircularLetter: {
    mapping: "https://vocab.getty.edu/aat/300026882",
    behavior: ["paged"],
  },
  MasterThesis: {
    mapping: "https://vocab.getty.edu/aat/300077723",
    behavior: ["paged"],
  },
  Note: {
    mapping: "https://vocab.getty.edu/aat/300027200",
    behavior: ["paged"],
  },
  Passport: {
    mapping: "https://vocab.getty.edu/aat/300027392",
    behavior: ["paged"],
  },
  PrayerBook: {
    mapping: "https://vocab.getty.edu/aat/300026476",
    behavior: ["paged"],
  },
  Protocol: {
    mapping: "https://vocab.getty.edu/aat/300164785",
    behavior: ["paged"],
  },
  BookOfMinutes: {
    mapping: "https://vocab.getty.edu/aat/300135375",
    behavior: ["paged"],
  },
  CopyBook: {
    mapping: "https://vocab.getty.edu/aat/300115825",
    behavior: ["paged"],
  },
  Receipt: {
    mapping: "https://vocab.getty.edu/aat/300027573",
    behavior: ["paged"],
  },
  Speech: {
    mapping: "https://vocab.getty.edu/aat/300026671",
    behavior: ["paged"],
  },
  Supplication: {
    mapping: "https://vocab.getty.edu/aat/300026030", // TODO: Find a better mapping
    behavior: ["paged"],
  },
  Telegram: {
    mapping: "https://vocab.getty.edu/aat/300026909",
    behavior: ["paged"],
  },
  Ticket: {
    mapping: "https://vocab.getty.edu/aat/300027381",
    behavior: ["individuals"],
  },
  Translation: {
    mapping: "https://vocab.getty.edu/aat/300027389",
    behavior: ["paged"],
  },
  Report: {
    mapping: "https://vocab.getty.edu/aat/300027267",
    behavior: ["paged"],
  },
  ShareCertificate: {
    mapping: "https://vocab.getty.edu/aat/300027558",
    behavior: ["paged"],
  },
  Memorandum: {
    mapping: "https://vocab.getty.edu/aat/300026906",
    behavior: ["paged"],
  },
  Minutes: {
    mapping: "https://vocab.getty.edu/aat/300027440",
    behavior: ["paged"],
  },
  DegreeCertificate: {
    mapping: "https://vocab.getty.edu/aat/300422252",
    behavior: ["paged"],
  },
  BachelorThesis: {
    mapping: "https://vocab.getty.edu/aat/300312343", // @TODO: Associated concepts, FIX
    behavior: ["paged"],
  },
  ShipsLog: {
    mapping: "https://vocab.getty.edu/aat/300027110",
    behavior: ["paged"],
  },
  PressClipping: {
    mapping: "https://vocab.getty.edu/aat/300429554",
    behavior: ["individuals"],
  },
  Brochure: {
    mapping: "https://vocab.getty.edu/aat/300248280",
    behavior: ["paged"],
  },
  Programme: {
    mapping: "https://vocab.getty.edu/aat/300027240",
    behavior: ["paged"],
  },
  Will: {
    mapping: "https://vocab.getty.edu/aat/300027764",
    behavior: ["paged"],
  },
  Bestallingsbrev: {
    mapping: "https://vocab.getty.edu/aat/300026030", // @TODO: Find a better mapping
    behavior: ["paged"],
  },
  DoctoralThesis: {
    mapping: "https://vocab.getty.edu/aat/300312076",
    behavior: ["paged"],
  },
  Flyer: {
    mapping: "https://vocab.getty.edu/aat/300224742",
    behavior: ["individuals"],
  },
  Journal: {
    mapping: "https://vocab.getty.edu/aat/300215390",
    behavior: ["paged"],
  },
  MortageDeed: {
    mapping: "https://vocab.getty.edu/aat/300027251",
    behavior: ["paged"],
  },
  EditedBook: {
    mapping: "https://vocab.getty.edu/aat/300026030", // @TODO: Find a better mapping
    behavior: ["paged"],
  },
  Thesis: {
    mapping: "https://vocab.getty.edu/aat/300028028",
    behavior: ["paged"],
  },
  Album: {
    mapping: "https://vocab.getty.edu/aat/300026695",
    behavior: ["paged"],
  },
  MapSet: {
    mapping: "https://vocab.getty.edu/aat/300026030", // @TODO: Find a better mapping
    behavior: ["individuals"],
  },
  Attachment: {
    mapping: "https://vocab.getty.edu/aat/300234049",
    behavior: ["individuals"],
  },
  ExLibris: {
    mapping: "https://vocab.getty.edu/aat/300028731",
    behavior: ["individuals"],
  },
  Sigil: {
    mapping: "https://vocab.getty.edu/aat/300417667", // Same as Seal, as AAT does not have pendant or applied seal
    behavior: ["individuals"],
  },
  Mark: {
    mapping: "https://vocab.getty.edu/aat/300028744",
    behavior: ["individuals"],
  },
  Seal: {
    mapping: "https://vocab.getty.edu/aat/300417667", // Same as Sigil, as AAT does not have pendant or applied seal
    behavior: ["individuals"],
  },
  Image: {
    mapping: "https://vocab.getty.edu/aat/300264387",
    behavior: ["individuals"],
  },
  Photograph: {
    mapping: "https://vocab.getty.edu/aat/300046300",
    behavior: ["individuals"],
  },
  Drawing: {
    mapping: "https://vocab.getty.edu/aat/300033973",
    behavior: ["individuals"],
  },
  GraphicArt: {
    mapping: "https://vocab.getty.edu/aat/300033973",
    behavior: ["individuals"],
    /* 
    GraphicArt i AAT er det en prosess, og jeg vet ikke om vi har fulgt "depend upon line and not color" i praksis. Så vi mapper til Drawing.
    Note: Processes and techniques for making images using the arts of printmaking, illustration, drawing, and other techniques that depend upon line and not color to render the design. In historical usage, the term referred more broadly to presentation in two-dimensional visual form, including most arts on paper, panel, or canvas, including painting.
    */
  },
  LivingImage: {
    mapping: "https://vocab.getty.edu/aat/300136900",
    behavior: ["individuals"],
  },
  Map: {
    mapping: "https://vocab.getty.edu/aat/300028094",
    behavior: ["individuals"],
  },
  Painting: {
    mapping: "https://vocab.getty.edu/aat/300033618",
    behavior: ["individuals"],
  },
  Postcard: {
    mapping: "https://vocab.getty.edu/aat/300026816",
    behavior: ["paged"],
  },
  Poster: {
    mapping: "https://vocab.getty.edu/aat/300027221",
    behavior: ["individuals"],
  },
  Advertisement: {
    mapping: "https://vocab.getty.edu/aat/300193993",
    behavior: ["individuals"],
  },
  CatalogueCard: {
    mapping: "https://vocab.getty.edu/aat/300026769",
    behavior: ["individuals"],
  },
}