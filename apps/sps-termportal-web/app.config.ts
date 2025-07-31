export default defineAppConfig({
  tb: {
    base: {
      systemTermbases: ["DOMENE", "LISENS"],
      legacyTermbases: ["NOT", "RTT"],
    },
    SN: {
      termlexTermpostBaseUrl: "https://termlex.no/term",
      standardOnlineBaseUrl: "https://online.standard.no/nb/",
    },
    SNOMEDCT: {
      browserUrl(edition: string, snomedId: string) {
        return `https://browser.ihtsdotools.org/?perspective=full&conceptId1=${snomedId}&edition=MAIN/SNOMEDCT-NO/${edition}&release=&languages=no,en`;
      },
    },
  },
});
