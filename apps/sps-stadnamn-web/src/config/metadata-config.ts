export interface DatasetTitles {
  [key: string]: string;
}

export interface SubindexPresentation {
  [key: string]: {
    img?: string;
    alt?: string;
    imageAttribution?: string;
    description?: string;
    initMode?: string;
    icon: string;
  }
}

export interface DatasetPresentation {
  [key: string]: {
    img: string;
    alt: string;
    imageAttribution: string;
    imageLicense?: { name: string, url: string };
    imageUrl?: { name: string, url: string };
    license: { name: string, url: string };
    attribution: string;
    links?: { title?: string, href: string, text?: string }[];
    subindices?: SubindexPresentation;
    initMode?: string;
  }
}

export const modes: Record<string, { title: string, description: string }> = {
  map: { title: "Kart", description: "Stadnamnsøk med kartvisning" },
  list: { title: "Liste", description: "Stadnamnsøk med listevisning" },
  table: { title: "Tabell", description: "Stadnamnsøk med tabellvisning" },
}

export const datasetTitles: DatasetTitles = {
  core_group_debug: "Debug",
  all: "Stadnamnsøk",
  core_gnidu: "GNIDu",
  geonames: "Geonames",
  tree: "Matriklar",
  base: "Grunnord",
  deep: "Djupinnsamlingar",
  bsn: "Bustadnamnregisteret",
  hord: "Hordanamn",
  rygh: "Norske Gaardnavne",
  nbas_reykjavik: "Den nasjonale stadnamnbasen (Legacy data)",
  m1838: "Matrikkelen 1838",
  m1886: "Matrikkelen 1886",
  mu1950: "Matrikkelutkastet 1950",
  skul: "Skulebarnsoppskriftene",
  leks: "Norsk stadnamnleksikon",
  leks_g: "Norsk stadnamnleksikon (Grunnord)",
  rygh_g: "Norske Gaardnavne (Grunnord)",
  ostf: "Bustadnavn i Østfold",
  sof: "Fylkesarkivet i Sogn og Fjordane",
  tot: "Totennavn",
  ssr2016: "Sentralt stadnamnregister 2016",
  ssr: "Sentralt stadnamnregister 2025",
  nrk: "NRKs gamle stadnamnarkiv",
  gn2019: "Geonames 2019",
  ft1900: "Folketeljinga 1900",
  ft1910: "Folketeljinga 1910",
  m2010: "Matrikkelen 2010",
  frogn: "Frognmaterialet",
  gjerd: "Gjerdrumundersøkelsen",
  sorum: "Sørummaterialet",
  kven: "Kvenske stedsnavn",
  snor: "Stadnamn i Noreg (Språkrådet)",
  herad: "Heradsregisteret",
  seta: "Seternamnarkivet",
  osm: "OpenStreetMap 2019",
  wikidata: "Wikidata"
}

export const datasetDescriptions: Record<string, string> = {
  core_group_debug: "",
  all: "Søk på tvers av alle datasett i Stadnamnportalen.",
  wikidata: "",
  ssr: "Sentralt stadnamnregister (SSR), Kartverket sitt offisielle register over stadnamn i Noreg. Språksamlingane hentar inn data minst ein gong i året, og organiserer oppslaga etter stadnamnnummer.",
  bsn: "Bustadnamnregisteret vart oppretta på 1950-talet og inneheld informasjon om namn på om lag 190 000 bustader (gardar, bruk og plassar) frå ti fylke i landet. Registeret består av om lag 109 000 arkivsedlar. Kvar seddel inneheld òg informasjon om fylke, kommune, gardsnummer og bruksnummer. Stadene er georefererte ut frå Kartverket si moderne matrikkel – så nøyaktig som mogleg.",
  hord: "Hordanamn er ei samling av stadnamn, særleg smånamn på åkrar, utmark, lier, tjern og fjell m.m. I alt 179 000 stadnamn frå det tidlegare Hordaland fylke er å finne i samlinga, fordelt på rundt 185 000 oppslag. Det er mogleg å sjå informasjon om kvart stadnamn og sjå plasseringa til namnet i kartet. Uttale er ofte oppgjeven, og i mange tilfelle er det òg mogleg å lytte til den lokale uttalen.",
  rygh: "Digitalisert utgåve av Oluf Rygh sitt standardverk for stadnamn i Noreg, opphavleg gjeve ut i 18 bind i åra 1897–1924. Oppslagsverket inneheld busetnadsnamn frå heile Noreg, unnateke Finnmark. Utgjevinga omfattar om lag 69 000 bustadnamn, derav ca. 3 700 namnegardsnamn, 44 500 gardsnamn, 16 000 bruksnamn, 4 000 forsvunne namn og 1 000 namn på sokn og herad. Kvart gardsnamn er oppgjeve med uttale og følgt gjennom tidene med språkvitskapleg tolking.",
  ostf: "Bustadnamn i Østfold er ei utgjeving over busetnadsnamna (bustadnamna) i Østfold heradsvis (22 herad etter den gamle inndelinga). Namneforskarane Tom Schmidt og Margit Harsson ved Seksjon for namnegransking (UiO) stod for redigering og utgjeving av serien, som byggjer på eit originalmanus av namnegranskaren Kåre Hoel (1922–1989). Serien vart gjeven ut mellom 1994 og 2021 og består av i alt 20 bind. Verket er ei sterkt utvida og revidert utgåve av Oluf Ryghs Norske Gaardnavne (bind 1 Smaalenenes Amt, 1897). Rygh avgrensa seg i hovudsak til namn på matrikkelgardane, men her er òg namn på andre busetnader tekne med, og gardsnamna får ei grundig behandling – både språkvitskapleg og kulturhistorisk.",
  leks: "Norsk stadnamnleksikon er eit digital oppslagsverk med stadnamn frå heile Noreg, og gjev forklaringar på opphavet til eit utval viktige stadnamn. Det er mogleg å søkje på både enkeltnamn og dei viktigaste grunnorda. Verket inneheld både norske, samiske og kvenske namn, og omfattar alle administrative inndelingar i Noreg fram til 2020. Den digitale utgåva er ei vidareføring av den siste trykte utgåva frå 1997.",
  m1838: "Matrikkelen av 1838 er eit landsomfattande register over jordeigedomar og namna og verdien deira. Dette var den første nye matrikkelen sidan 1665. Registeret omfattar nesten 43 000 gardar og 110 000 bruk, alle med namn, matrikkel- og løpenummer. Matrikkelen er den første heilnorske matrikkelen og dekkjer heile landet unnateke Finnmark, som ikkje vart matrikulert før om lag 150 år seinare.",
  m1886: "Matrikkelen av 1886 er ei oversikt over jordeigedomar i heile landet, med namn, matrikkelnummer og verdi. Som noko nytt vart gardsnummer og bruksnummer tekne i bruk. Alle landets fylke, unnateke Finnmark, er dekte. For kvart bruksnummer er gjeve gards- og bruksnamn, i alt nesten 208 000 matriklar. Matrikkelen vert rekna som den første moderne matrikkelen, fastsett etter det systemet vi kjenner i dag.",
  mu1950: "Matrikkelutkastet av 1950 var førebuinga til ein ny matrikkel for heile Noreg, men arbeidet vart aldri fullført. I staden vart kommunale eigedomsregister nytta. Utkastet dekkjer over 767 000 matriklar frå landkommunane i alle fylke unnateke Finnmark. Kvar matrikkel er oppgjeven med gards- og bruksnamn, matrikkelnummer og verdi.",
  skul: "Skulebarnsoppskriftene var ein landsdekkjande dugnad i perioden 1931–1935, der skuleelevar samla inn stadnamn frå eigne bruk. Det vart samla inn stadnamn frå i alt 9700 matrikkelgardar i 13 fylke. Innsamlingsprosjektet vart organisert av namnegranskaren Gustav Indrebø (1889–1942), og omfattar totalt over 1 million namn. Dette datasettet omfattar inntil vidare berre fylka Nordland og Troms.",
  sof: "Stadnamnsamlinga frå Fylkesarkivet i Sogn og Fjordane, no overført til Fylkesarkivet i Vestland, er resultatet av ei stor innsamling på 1980-talet frå Sogn og Fjordane og Møre og Romsdal. Supplerande innsamlingar vart òg gjorde i enkelte kommunar seinare.",
  tot: "Totennamn er ei samling av namn på gardar, bruk, småbruk, forsvunne stadnamn, skogteigar og jorder frå heile Toten. Materialet byggjer på kjeldemateriale samla inn til Norsk stadnamnarkiv ved Universitetet i Oslo. Arbeidet vart utført av Trond Nygård på oppdrag frå dåverande Seksjon for namnegransking. Prosjektet vart avslutta i 2007. Kartfesting vart gjort ved Språksamlingane i 2024.",
  ssr2016: "Datasettet Sentralt stadnamnregister 2016 byggjer på Kartverket sitt første gratis stadnamndatasett, opphavleg lansert i 2000. Stadnamna var del av søkjetenesta Norgesglaset, der det var mogleg å søkje på alle gateadresser i Noreg eller i ca. 700 000 stadnamn. Kartgrunnlaget til stadnamndatasettet var fem landsdekkjande kartseriar i målestokkane 1:2 millionar, 1:1 million, 1:250 000, 1:50 000 og 1:5 000. Norgesglaset vart i 2015 erstatta av tenesta Norgeskart, og i 2016 vart det noverande SSR lansert med ny datastruktur.",
  nrk: "NRK sitt gamle stadnamnarkiv vart laga rundt 1960. Arkivet har tilrådd uttale for 2000 ulike stadnamn i Noreg. I datasettet finn du tilrådd uttale frå det gamle arkivet. Merk at uttalen av stadnamn kan endre seg over tid, og at uttalen som var tilrådd på 1960-talet ikkje nødvendigvis samsvarar med uttalen i dag.",
  m2010: "Datasettet Matrikkelen 2010 er basert på GAB-registeret (Grunneiendom-, adresse- og bygningsregisteret) – eit offentleg register over faste eigedomar i Noreg. Registeret vart ført av Statens kartverk for kvar kommune med opplysningar om alle grunneigedomar, festegrunnar med eige grunnboksblad i tinglysingsregisteret, samt anna med eige grunnboksblad, til dømes eigarseksjonar. I tillegg til nemning og stadfesting av eigedomen inneheld GAB-registeret opplysningar om kva for ein eigedom han var utskild frå, arealet, eigarforhold, adresse og bygningsdata. GAB-registeret er i dag avløyst av matrikkelen.",
  gn2019: "GeoNames er ein brukarstyrt geografisk database grunnlagd i 2005 og tilgjengeleg via ulike nettenester under Creative Commons-lisens. Databasen inneheld over 25 millionar geografiske namn for meir enn 11,8 millionar unike stader globalt, med meir enn 600 000 norske stadnamn. Data inkluderer namn på fleire språk, koordinater, høgd over havet, folketal, administrative inndelingar og postnummer. Alle koordinater nyttar World Geodetic System 1984 (WGS84). Brukarar kan redigere og forbetre databasen gjennom eit wiki-grensesnitt, noko som gjer GeoNames til eit levande og stadig oppdatert geografisk oppslagsverk. Dette datasettet er basert på eit uttrekk frå 2019, men vert jamleg oppdatert.",
  geonames: "GeoNames er ein brukarstyrt geografisk database grunnlagd i 2005 og tilgjengeleg via ulike nettenester under Creative Commons-lisens. Databasen inneheld over 25 millionar geografiske namn for meir enn 11,8 millionar unike stader globalt, med meir enn 600 000 norske stadnamn. Data inkluderer namn på fleire språk, koordinater, høgd over havet, folketal, administrative inndelingar og postnummer. Alle koordinater nyttar World Geodetic System 1984 (WGS84). Brukarar kan redigere og forbetre databasen gjennom eit wiki-grensesnitt, noko som gjer GeoNames til eit levande og stadig oppdatert geografisk oppslagsverk.",
  ft1900: "Folketeljinga 1900 vart gjennomført 3. desember 1900 i Noreg, då landet hadde 2 239 880 personar som heimehøyrande folkemengd. Heile befolkninga skulle registrerast der kvar enkelt oppheldt seg. Datamaterialet inneheld om lag 160 000 stadnamn. Folketeljinga er oppbevart i statsarkiva, er fullstendig mikrofilma og tilgjengeleg i skanna og søkbar form i Digitalarkivet. Statistikken viser oversyn over befolkninga fordelt på byar, heradskommunar og amt, der både landdistrikt og byar er inkluderte for kvart amt.",
  ft1910: "Folketeljinga 1910 vart gjennomført 1. desember 1910 i Noreg, då landet hadde 2 391 782 heimehøyrande innbyggjarar. Datamaterialet inneheld om lag 175 000 stadnamn. For første gong vart befolkninga beden om å oppgje statsborgarskap, noko om lag 41 000 personar gjorde, der tre fjerdedelar var svenske. Statistikken viser oversyn over befolkninga fordelt på byar, heradskommunar og amt, der både landdistrikt og byar er inkluderte for kvart amt.",
  frogn: "",
  gjerd: "",
  sorum: "",
  kven: "Datasettet kvenske stadnamn dokumenterer namnetradisjonar i Troms og Finnmark som vitnar om fleire hundre års busetjing og kulturell tilhøyrsle. Kvensk stadnamnteneste – Paikannimipalvelus redigerer og oppdaterer databasen som del av Språkrådet si stadnamnteneste. Områda med kvenske stadnamn har ofte fleirspråkleg namnebruk med kvenske, samiske og norske namn. Datasettet inneheld nærmare 8500 namneartiklar. Viktige kjelder er Sentralt stadnamnregister (SSR) med 4–5000 kvenske namn og ca. 12 400 namnesedlar samla inn av finske forskarar mellom 1970–1990, oppbevarte i Namnarkivet i Helsingfors med kopiar ved Universitetet i Tromsø og Kvensk stadnamnteneste.",
  snor: "Eit landsdekkjande datasett knytt til tilskotsordninga for innsamling og registrering av stadnamn. Databasen inneheld om lag 170 000 norske, samiske og kvenske stadnamn, og vart oppretta for å ta vare på og registrere stadnamn som elles ville gå tapt. Per 2025 inneheld basen namn frå 158 kommunar, der meir enn 95 kommunar har over 50 registrerte namn kvar. Alle innsamlings- og registreringsprosjekt som får støtte gjennom tilskotsordninga, må leggje inn stadnamna i denne databasen.",
  herad: "Heradsregisteret er ei omfattande samling i Norsk stadnamnarkiv som inneheld om lag 400 000 stadnamn frå heile Noreg. Kvar oppslag i registeret inneheld informasjon om namnet, uttalen, administrativ tilhøyrsle og kartreferansar. Tilleggsinformasjon om namnet eller lokaliteten er vanleg. Samlinga var grunnstamma i \"Den nasjonale stadnamnbasen\" og bidreg med unik dokumentasjon av norske stadnamn.",
  seta: "Seternamnarkivet er ei omfattande samling som inneheld 50 000 namn på setrar. Samlinga var opphavleg organisert i to seddelsamlingar — ei ordna etter herad og ei for heile landet. Registeret vart skanna i samband med Dokumentasjonsprosjektet og inngjekk i skanna versjon som del av \"Den nasjonale stadnamnbasen\"."
}

export const datasetShortDescriptions: Record<string, string> = {
  core_group_debug: "",
  all: "Søk på tvers av alle datasett i Stadnamnportalen.",
  ssr: "Kartverket sitt offisielle register over stadnamn i Noreg. Språksamlingane hentar inn data minst ein gong i året, og organiserer oppslaga etter stadnamnnummer.",
  wikidata: "",
  bsn: "Oppretta på 1950-talet, inneheld informasjon om namn på om lag 190 000 bustader frå ti fylke i Noreg.",
  hord: "Ei samling av 179 000 stadnamn frå tidlegare Hordaland fylke, inkludert smånamn for åkrar, utmark, lier, tjørn og fjell.",
  rygh: "Digitalisert utgåve av Oluf Rygh sitt standardverk for stadnamn i Noreg, opphavleg gjeve ut i 18 bind i åra 1897–1924.",
  ostf: "Ein 20-binds serie gjeven ut mellom 1994 og 2021, som dekkjer bustadnamn i det tidlegare Østfold fylke.",
  leks: "Digital vidareføring av Norsk stadnamnleksikon (1997) som forklarar opphavet til viktige stadnamn i Noreg, inkludert norske, samiske og kvenske namn, samt administrative inndelingar.",
  m1838: "Noregs første omfattande matrikkel frå 1800-talet, som dekkjer heile landet unnateke Finnmark.",
  mu1950: "Utkast til ein ny nasjonal matrikkel som aldri vart fullført. Han dekte over 767 000 oppføringar frå landkommunar.",
  m1886: "Reknast som Noregs første moderne matrikkel, og innførte gards- og bruksnummer for heile landet unnateke Finnmark.",
  skul: "Eit landsdekkjande prosjekt frå 1931–1935 der skuleborn samla inn over 1 million stadnamn frå 9 700 registrerte gardar i 13 fylke.",
  sof: "Eit omfattande materiale som er resultatet av ei stor innsamling av stadnamn på 1980-talet frå Sogn og Fjordane og Møre og Romsdal.",
  tot: "Ei samling av ulike stadnamn frå Toten-regionen, basert på kjeldemateriale samla inn til Norsk stadnamnarkiv ved Universitetet i Oslo.",
  ssr2016: "Basert på Kartverket sitt første frie stadnamndatasett frå 2000. Databasen var i bruk fram til 2016 då den noverande databasen vart lansert.",
  nrk: "NRK sitt stadnamnarkiv frå 1960 inneheld tilrådd uttale for 2000 stadnamn i Noreg. Uttalen kan ha endra seg sidan den gong.",
  m2010: "Eit datasett basert på GAB-registeret (Grunneiendom-, adresse- og bygningsregisteret), som var eit offentleg register over faste eigedomar i Noreg.",
  gn2019: "GeoNames 2019 gjev over 600 000 norske stadnamn med koordinater, høgd, administrative inndelingar og språkvariantar.",
  geonames: "GeoNames er ein brukarstyrt geografisk database grunnlagd i 2005 og tilgjengeleg via ulike nettenester under Creative Commons-lisens. Databasen inneheld over 25 millionar geografiske namn for meir enn 11,8 millionar unike stader globalt, med meir enn 600 000 norske stadnamn. Data inkluderer namn på fleire språk, koordinater, høgd over havet, folketal, administrative inndelingar og postnummer. Alle koordinater nyttar World Geodetic System 1984 (WGS84). Brukarar kan redigere og forbetre databasen gjennom eit wiki-grensesnitt, noko som gjer GeoNames til eit levande og stadig oppdatert geografisk oppslagsverk.",
  ft1900: "Folketeljinga 1900 inneheld ca. 160 000 stadnamn brukt i befolkningsstatistikk, tilgjengeleg i Digitalarkivet.",
  ft1910: "Folketeljinga 1910 inneheld ca. 175 000 stadnamn og informasjon om statsborgarskap, tilgjengeleg i Digitalarkivet.",
  frogn: "",
  gjerd: "",
  sorum: "",
  kven: "Kvenske stadnamn frå Troms og Finnmark, med nær 8 500 namneartiklar frå SSR og finske forskarar, og fleirspråkleg namnebruk.",
  snor: "Datasettet knytt til tilskotsordninga for innsamling og registrering av stadnamn. Databasen inneheld om lag 170 000 norske, samiske og kvenske stadnamn, og vart oppretta for å ta vare på namn som elles ville gå tapt.",
  herad: "Heradsregisteret er ein del av Norsk stadnamnarkiv, og var grunnstamma i \"Den nasjonale stadnamnbasen\" utvikla ved UiO.",
  seta: "Seternamnarkivet inneheld 50 000 namn på setrar frå heile landet, digitalisert frå to historiske seddelsamlingar."
}



export const publishDates: Record<string, string> = {
  bsn: "2024-05-29",
  wikidata: "2025-07-07",
  hord: "2024-02-07",
  rygh: "2024-05-29",
  m1838: "2024-05-29",
  m1886: "2024-05-29",
  mu1950: "2024-05-29",
  skul: "2024-03-22",
  leks: "2024-05-29",
  leks_g: "2024-03-27",
  ostf: "2024-05-29",
  sof: "2024-06-13",
  tot: "2024-08-26",
  ssr2016: "2024-09-10",
  ssr: "2025-06-09",
  nrk: "2025-03-06",
  gn2019: "2025-03-13",
  geonames: "2025-10-30",
  ft1900: "2025-03-13",
  ft1910: "2025-03-13",
  m2010: "2025-03-13",
  frogn: "2025-04-23",
  gjerd: "2025-04-23",
  sorum: "2025-04-24",
  kven: "2025-04-24",
  snor: "2025-04-25",
  herad: "2025-04-25",
  seta: "2025-04-25"
}


export const licenses: Record<string, { name: string, url: string }> = {
  ccby4: {
    name: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/deed.no"
  },
  ccbyncsa3: {
    name: "CC BY-NC-SA 3.0",
    url: "https://creativecommons.org/licenses/by-nc-sa/3.0/deed.no"
  }
}



export const datasetPresentation: DatasetPresentation = {
  all: {
    img: "icon.svg",
    alt: "Kart over Noreg med stadnamn",
    imageAttribution: "Kartverket",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  wikidata: {
    img: "/datasets/Wikidata-logo.svg",
    alt: "Wikidata logo",
    imageAttribution: "Wikimedia Foundation",
    attribution: "Wikidata, flata ut av Språksamlingane",
    license: licenses.ccby4,
  },  
  bsn: {
    img: "/datasets/ubb-spr-bp-0001_sm.jpg",
    alt: "Ei kvinneleg arkivar eller kontorist sit ved eit skrivebord framfor ei stor rekkje arkivskuffer.",
    imageAttribution: "Avdeling for spesialsamlingar, Universitetsbiblioteket i Bergen",
    attribution: "Språksamlingane",
    license: licenses.ccby4
  },
  hord: {
    img: "/datasets/3037_general_7_1925_jpg300dpi.jpg",
    alt: "Utsnitt av kart over Hordaland og Sogn og Fjordane",
    imageAttribution: "Kartverket: Generalkart VII, L. Arentz 1929",
    attribution: "Institutt for lingvistiske, litterære og estetiske studiar. Berika av Språksamlingane",
    license: licenses.ccby4,
  },
  rygh: {
    img: "/datasets/Prof_oluf_rygh.jpg",
    alt: "Oluf Rygh, portrettfoto",
    imageAttribution: "Noregs geografiske oppmåling; retusjering: J. Nordhagen.",
    attribution: "Riksarkivet og Dokumentasjonsprosjektet. Berika av Språksamlingane",
    license: licenses.ccby4,
  },
  ostf: {
    img: "/datasets/Østfold_gml_herredsinndeling.png",
    alt: "Verket byggjer på den gamle herredsinndelinga i Østfold",
    imageAttribution: "Bustadnamn i Østfold",
    attribution: "Kåre Hoel, Margit Harsson og Tom Schmidt. Berika av Språksamlingane",
    license: licenses.ccby4,
  },
  leks: {
    img: "/datasets/leks2.png",
    alt: "Framside til Norsk stadnamnleksikon 1997",
    imageAttribution: "Skanna av Språksamlingane",
    license: licenses.ccby4,
    attribution: "Berit Sandnes. Berika av Språksamlingane",
    subindices: {
      leks_g: {
        initMode: "list",
        icon: "base"
      }
    },
  },
  m1838: {
    img: "/datasets/Matrikkelen_1838_Bykle_anneks_utsnitt.jpg",
    alt: "Utsnitt frå Matrikkelen 1838, Bykle anneks",
    imageAttribution: "Aust-Agder fylke, Nedenæs amt, Matrikkel , 1838-, oppb: Riksarkivet",
    attribution: "Riksarkivet og Registreringssentral for historiske data, UiT. Berika av Språksamlingane",
    license: licenses.ccby4,
  },
  m1886: {
    img: "/datasets/No-nb_digibok_2014010838007_0180_1.jpg",
    alt: "Den førebuande matrikkelkommisjonen i Kråkstad i 1864",
    imageAttribution: "Østlid, Martin. \"Kråkstad\", s. 180 (nb.no)",
    attribution: "Riksarkivet og Registreringssentral for historiske data, UiT. Berika av Språksamlingane",
    license: licenses.ccby4,
  },
  mu1950: {
    img: "/datasets/6541_inndeling_s_1950_jpg300dpi.jpg",
    alt: "Heradskart 1950",
    imageAttribution: "Kartverket, kommuneinndelingar 1950",
    attribution: "Språksamlingane, opphavleg digitalisert av Dokumentasjonsprosjektet",
    license: licenses.ccby4,
  },
  skul: {
    img: "/datasets/ubb-kk-n-520-005_sm.jpg",
    alt: "Interiør frå klasserom, jenteklasse",
    imageAttribution: "Avdeling for spesialsamlingar, Universitetsbiblioteket i Bergen",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  sof: {
    img: "/datasets/SOF.JPG",
    alt: "Utbreiingskart over Fylkesarkivet sine stadnamnsamlingar",
    imageAttribution: "Fylkesarkivet i Vestland",
    attribution: "Fylkesarkivet i Vestland. Berika av Språksamlingane",
    license: licenses.ccby4,
    links: [{ title: "Nettstad: ", href: "https://www.fylkesarkivet.no/stadnamn.380535.no.html" }]
  },
  tot: {
    img: "/datasets/toten.png",
    alt: "Historisk fotografi med gardar og bruk ved Einavatnet.",
    imageAttribution: "Avdeling for spesialsamlingar, Universitetsbiblioteket i Bergen",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  ssr2016: {
    img: "/datasets/Logo ståande, WEB-fargar.svg",
    alt: "Kartverkets logo",
    imageAttribution: "Statens kartverk",
    attribution: "Statens kartverk og Språksamlingane",
    license: licenses.ccby4,
  },
  ssr: {
    img: "/datasets/Logo ståande, WEB-fargar.svg",
    alt: "Kartverkets logo",
    imageAttribution: "Statens kartverk",
    attribution: "Statens kartverk og Språksamlingane",
    license: licenses.ccby4,
  },
  nrk: {
    img: "/datasets/Norsk-rikskringkasting-Logo.svg",
    alt: "NRKs logo",
    imageAttribution: "Norsk rikskringkasting",
    attribution: "NRK",
    license: licenses.ccby4,
  },
  gn2019: {
    img: "/datasets/geonames_logo_icon_171110.svg",
    alt: "Geonames, logo",
    imageAttribution: "Geonames",
    attribution: "Geonames",
    license: licenses.ccby4,
  },
  geonames: {
    img: "/datasets/geonames_logo_icon_171110.svg",
    alt: "Geonames",
    imageAttribution: "Geonames",
    attribution: "Geonames",
    license: licenses.ccby4,
  },
  ft1900: {
    img: "/datasets/042sAXjQ1pbw.jpg",
    alt: "Punchedamer i arbeid i Statistisk Centralbureau ved folketeljinga 1900",
    imageAttribution: "Foto: Colditz, Caroline",
    imageUrl: { "name": "oslobilder.no", "url": "http://www.oslobilder.no/NTM/NTM%20C%2011164" },
    imageLicense: licenses.ccbyncsa3,
    attribution: "Statistisk sentralbyrå, berika av Språksamlingane",
    license: licenses.ccby4,
  },
  ft1910: {
    img: "/datasets/ft1910.png",
    alt: "Foto: Ukjent ca 1900-1910",
    imageAttribution: "Avdeling for spesialsamlingar, Universitetsbiblioteket i Bergen",
    imageUrl: { "name": "marcus.uib.no", "url": "https://marcus.uib.no/instance/photograph/ubb-bros-04220" },
    attribution: "Statistisk sentralbyrå, berika av Språksamlingane",
    license: licenses.ccby4,
  },
  m2010: {
    img: "/datasets/Logo ståande, WEB-fargar.svg",
    alt: "Kartverkets logo",
    imageAttribution: "Statens kartverk",
    attribution: "Matrikkelen 2010",
    license: licenses.ccby4,
  },
  frogn: {
    img: "/datasets/Frogn_komm.svg",
    alt: "Våpen for Frogn kommune i Akershus fylke",
    imageAttribution: "",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  gjerd: {
    img: "/datasets/Gjerdrum_komm.svg",
    alt: "Våpen for Gjerdrum kommune i Akershus fylke",
    imageAttribution: "",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  sorum: {
    img: "/datasets/Sørum_komm.svg",
    alt: "Våpen for Sørum kommune i Akershus fylke",
    imageAttribution: "",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  kven: {
    img: "/datasets/Flag_of_the_Kven_people.svg",
    alt: "Kvenske stadnamn",
    imageAttribution: "",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  snor: {
    img: "/datasets/idD1wneqED_logos.svg",
    alt: "Språkrådets logo",
    imageAttribution: "Språkrådet",
    attribution: "Språkrådet og Språksamlingane",
    license: licenses.ccby4,
  },
  herad: {
    img: "/datasets/Akersdalen_(1949).jpg",
    alt: "Akersdalen (seinare kalla Groruddalen), omtrent på den tida Aker vart innlemma i Oslo.",
    imageAttribution: "Oslo byarkiv, Wikimedia Commons",
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  seta: {
    img: "/datasets/ubb-kk-ncn-0275_md.jpg",
    alt: "Stølen til garden Seim i Grøndalen, Røldal.",
    imageAttribution: "Foto: Knud Knudsen. Avdeling for spesialsamlingar, Universitetsbiblioteket i Bergen",
    imageUrl: { "name": "marcus.uib.no", "url": "https://marcus.uib.no/instance/photograph/ubb-kk-ncn-0275" },
    attribution: "Språksamlingane",
    license: licenses.ccby4,
  },
  osm: {
    img: "/datasets/osm.png",
    alt: "Kartutsnitt frå OpenStreetMap",
    imageAttribution: "OpenStreetMap",
    attribution: "OpenStreetMap",
    license: licenses.ccby4,
  }
}

export const subpages: Record<string, string[]> = {
  leks: ["Nokre ord om nemningar, namngjeving og namnegransking", "Område- og bygdenamn", "Gards- og andre bustadnamn", "Elvenamn", "Innsjønamn", "Fjordnamn", "Øynamn", "Fjellnamn", "Seternamn"]
}

export const featureNames: Record<string, string> = {
  "image": "Faksimiler",
  "audio": "Lydopptak",
  "phonetic": "Lydskrift",
  "coordinates": "Koordinater",
  "link": "Lenker",
  "maps": "Skannede kart",
  "base": "Grunnord",
  "prep": "Preposisjoner",
  "digi": "Digitalisert materiale", // Inkluderer eksternt materiale

}

export const typeNames: Record<string, string> = {
  "sprak": "Språksamlingane", // Fysisk materiale oppbevart i Språksamlingene
  "encyclopedia": "Oppslagsverk",
  "database": "Database",
  "public": "Offentleg register",
  "collection": "Djupinnsamling", // Toponomastic collection
}




export const datasetFeatures: Record<string, string[]> = {
  ssr: ["link"],
  bsn: ["image"],
  hord: ["audio", "coordinates", "phonetic", "digi"],
  rygh: ["phonetic", "digi", "base"],
  m1838: ["link"],
  m1886: ["link"],
  mu1950: ["link"],
  skul: ["image", "digi"],
  leks: ["phonetic", "base", "digi"],
  ostf: ["link"],
  sof: ["link", "coordinates", "phonetic"],
  tot: ["phonetic"],
  ssr2016: ["link"],
  nrk: ["phonetic", "image", "digi"],
  gn2019: ["link"],
  geonames: ["link"],
  frogn: ["phonetic"],
  gjerd: ["phonetic"],
  sorum: ["phonetic"],
  herad: ["image", "digi"],
  seta: ["image", "digi"]
}

export const datasetTypes: Record<string, string[]> = {
  ssr: ["database", "public"],
  bsn: ["sprak", "collection"],
  hord: ["sprak", "database", "collection"],
  rygh: ["encyclopedia", "collection"],
  herad: ["sprak", "collection"],
  seta: ["sprak", "collection"],
  m1838: ["public"],
  m1886: ["public"],
  mu1950: ["public", "sprak"],
  skul: ["sprak", "collection"],
  leks: ["encyclopedia", "collection"],
  ostf: ["encyclopedia", "collection"],
  sof: ["database", "collection"],
  tot: ["database", "sprak", "collection"],
  ssr2016: ["database", "public"],
  nrk: ["database", "collection"],
  gn2019: ["database"],
  geonames: ["database"],
  m2010: ["database", "public"],
  gjerd: ["collection"],
  sorum: ["collection"],
  frogn: ["collection"],
  kven: ["database", "collection"],
  snor: ["database", "collection"],
}

// Workaround to include grunnord in Stadnamngransking-filter
datasetTypes["leks_g"] = datasetTypes["leks"]
datasetTypes["rygh_g"] = datasetTypes["rygh"]

