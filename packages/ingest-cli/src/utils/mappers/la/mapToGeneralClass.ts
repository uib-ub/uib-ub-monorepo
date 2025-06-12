const WrittenWork = [
  "Document",
  "WrittenWork",
  "Manuscript",
  "Book",
  "Proceedings",
  "Article",
  "AcademicArticle",
  "Bill",
  "Booklet",
  "CashBook",
  "Charter",
  "Circulaire",
  "Contract",
  "Copy",
  "Transcription",
  "Vidisse",
  "Deed",
  "SaleDeed",
  "Diary",
  "JourneyLog",
  "FinancialStatement",
  "Form",
  "Fragment",
  "Issue",
  "LandSurvey",
  "Letter",
  "CircularLetter",
  "MasterThesis",
  "Note",
  "Passport",
  "PrayerBook",
  "Protocol",
  "BookOfMinutes",
  "CopyBook",
  "Speech",
  "Supplication",
  "Telegram",
  "Ticket",
  "Translation",
  "Report",
  "ShareCertificate",
  "Memorandum",
  "Minutes",
  "DegreeCertificate",
  "BachelorThesis",
  "ShipsLog",
  "PressClipping",
  "Brochure",
  "Programme",
  "Will",
  "Bestallingsbrev",
  "Bestallingsbrev",
  "DoctoralThesis",
  "Flyer",
  "Journal",
  "MortageDeed",
  "EditedBook",
  "Thesis",
  "Map",
  "MapSet",
]

export const Publication = [
  "Book",
  "Proceedings",
  "Article",
  "AcademicArticle",
  "Booklet",
  "Charter",
  "Circulaire",
  "Issue",
  "LandSurvey",
  "Letter",
  "CircularLetter",
  "MasterThesis",
  "PrayerBook",
  "Report",
  "BachelorThesis",
  "Brochure",
  "Programme",
  "DoctoralThesis",
  "Flyer",
  "Journal",
  "EditedBook",
  "Thesis",
  "Map",
  "MapSet",
]

const Image = [
  "Image",
  "Photograph",
  "Drawing",
  "GraphicArt",
  "LivingImage",
  "Map",
  "Painting",
  "Postcard",
  "Poster",
]

const Video = [
  "LivingImage"
]

const Item = [
  "Box",
  "Object",
  "Button",
  "T-Shirt",
  "Vessel",
  "Ship",
  "Monument",
  "Postcard",
  "Poster",
  "Painting",
  "Drawing",
  "GraphicArt",
  "LivingImage",
  "Photograph",
  "Building",
  "Furniture",
  "Machine",
  "Tool",
  "Weapon",
  "Vehicle",
]

const Person = [
  "Person",
]

const Group = [
  "Group",
  "Organization",
  "Company",
  "Institution",
  "Association",
  "Club",
  "Society",
  "Agent",
  "Family",
]

export const mapToGeneralClass = (type: string): string => {
  const isWrittenWork = WrittenWork.includes(type);
  const isImage = Image.includes(type);
  const isVideo = Video.includes(type);

  switch (true) {
    case isWrittenWork:
      return "Text";
    case isImage:
      return "Image";
    case isVideo:
      return "Video";
    default:
      return "Other";
  }
}

export const getLAApiType = (type: string): { path: string, type: string } => {
  const isItem = Item.includes(type);
  const isPerson = Person.includes(type);
  const isGroup = Group.includes(type);

  switch (true) {
    case isItem:
      return { path: "items", type: "HumanMadeObject" };
    case isPerson:
      return { path: "person", type: "Person" };
    case isGroup:
      return { path: "groups", type: "Group" };
    default:
      return { path: "groups", type: "Group" };
  }
}