const WrittenWork = [
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