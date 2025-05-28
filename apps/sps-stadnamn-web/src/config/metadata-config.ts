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
    imageLicense?: {name: string, url: string};
    imageUrl?: {name: string, url: string};
    license: {name: string, url: string};
    attribution: string;
    links?: {title?: string, href: string, text?: string}[];
    subindices?: SubindexPresentation;
    initMode?: string;
  }
}

export const datasetTitles: DatasetTitles = {
    search: "Stadnamnsøk",
    all: "Grunnlagsdata",
    bsn: "Bustadnavnregisteret",
    hord: "Hordanamn",
    rygh: "Norske Gaardnavne",
    nbas_reykjavik: "Den nasjonale stadnamnbasen (Legacy data)",
    m1838: "Matrikkelen 1838", 
    m1886: "Matrikkelen 1886",
    mu1950: "Matrikkelutkastet 1950", 
    skul: "Skulebarnsoppskriftene",
    leks: "Norsk stadnamnleksikon",
    leks_g: "grunnord",
    ostf: "Bustadnavn i Østfold",
    sof: "Fylkesarkivet i Sogn og Fjordane",
    tot: "Totennavn",
    ssr2016: "Sentralt stadnamnregister 2016",
    ssr2020: "Sentralt stadnamnregister 2020",
    nrk: "NRKs gamle stadnamnarkiv",
    gn2019: "Geonames",
    ft1900: "Folketellingen 1900",
    ft1910: "Folketellingen 1910",
    m2010: "Matrikkelen 2010",
    frogn: "Frognmaterialet",
    gjerd: "Gjerdrumundersøkelsen",
    sorum: "Sørummaterialet",
    kven: "Kvenske stedsnavn",
    snor: "Stedsnavn i Norge",
    herad: "Heradsregisteret",
    seta: "Seternamnarkivet",
    osm: "OpenStreetMap 2019"

}

export const datasetDescriptions: Record<string, string> = {
  search: "Stadnamnsøk er Språksamlinganes overordna søk, som samanstiller data frå ei rekke datasett og slår saman resultat med tilnærma same namn. Oppslag i dei einskilde datasetta blir her lista opp som kjelder.",
  all: "Søk på tvers av grunnlagsdatasetta. Merk at dette søket kan vere tregare enn stadnamnsøk, og felta er ikkje like standardiserte. Det er derfor meist eigna til å samanlikne eit utval datasett på felt som overlappar.",
  bsn: "Bustadnavnregisteret ble skapt på 1950-talet inneholder informasjon om navn på ca 190 000 bosteder (garder, bruk og plasser) fra ti fylker i landet. Registeret består av ca. 109 000 arkivsedler. Hver seddel inneholder også informasjon om fylke, kommune, gardsnummer og bruksnummer. Stedene er georeferert utifra kartverkets moderne matrikkel - så nøyaktig som mulig.",
  hord: "Hordanamn er ei samling av stadnamn, især smånamn på åkrar, utmark, lier, tjern og fjell, m.m. I alt 179 000 stadnamn frå det tidligere Hordaland fylke er å finne i samlingen, fordelt på rundt 185 000 oppslag. Det er mulig å se informasjon om hvert stadnamn og se plasseringen til namnet i kartet. Uttale er ofte angitt og i mange tilfelle er det òg mogleg å lytte til den lokale uttalen.",
  rygh: "Digitalisert utgave av Oluf Ryghs standardverk for stedsnavn i Norge, opprinnelig utgitt i 18 bind i årene 1897-1924. Oppslagsverket inneholder bebyggelsesnavn fra hele Norge, unntatt Finnmark. Utgivelsen omfatter om lag 69 000 bostedsnavn, derav ca. 3 700 navnegardsnavn, 44 500 gardsnavn, 16 000 bruksnavn, 4 000 forsvunne navn og 1 000 navn på sokn og herreder. Hvert gardsnavn er angitt med uttale og følges historisk ned gjennom tidene og med en språklig tolkning.",
  ostf: `Bustadnavn i Østfold er en utgivelse over bebyggelsesnavna (bustadnavna) i Østfold herredsvis (22 herred etter den gamle inndelinga). Navneforskerne Tom Schmidt og Margit Harsson ved Seksjon for navnegransking (UiO) sto for redigering og utgiving av serien, som bygger på et originalmanus av navnegranskeren Kåre Hoel (1922-1989), en navnegranskerkollega. Serien ble utgitt mellom 1994 og 2021 og består av i alt 20 bind. Verket er en sterkt utvidet og revidert utgave av Oluf Ryghs Norske Gaardnavne (bind 1 Smaalenenes Amt, 1897). Rygh begrenset seg i all hovedsak til navn på matrikkelgårdene, men nå er også navn på andre bebyggelser tatt opp til drøfting, samtidig som gårdsnavnene gis en fyldig behandling - både språklig og kulturhistorisk.`,
  leks: "Norsk stadnamnleksikon er ei digital utgiving av stadnamn frå heile Noreg og er eit søk som gir forklaring på opphavet av viktige stadnamn i Noreg. Det er mogleg å søkja på både enkeltnamn og dei viktigaste grunnorda. Verket inneheld både norske, samiske og kvenske namn og samstundes alle administrative inndelingane i Noreg frå før 2020. Den digitale Norsk stadnamnleksikon er ei vidareføring av siste trykte utgåve frå 1997.",
  //nbas: "Den nasjonale stedsnavnbasen inneholder om lag 700 000 navn totalt (fordelte på kortsamlinger fra herredsregistret, seternavnregisteret, en del enkeltsamlinger, og stedsnavnsamlingen ved Universitetet i Bergen. Hvert navnekort inneholder navneform, uttale og informasjon om tilhørighet til kommune og fylke. I mange tilfelder er også gardsnummer oppgitt. I tillegg inneholder basen 3 700 originale innsamlingskart.",
  m1838: "Matrikkelen av 1838 er et landsomfattende register over jordeiendommer og deres navn og verdi. Dette var den første nye matrikkel siden 1665. Registeret omfatter nesten 43 000 garder og 110 000 bruk, alle angitt navn, matrikkel- og løpenummer. Matrikkelen er landets første helnorske matrikkel og dekker hele landet unntatt Finnmark, der ikke ble matrikulert før enn godt 150 år senere.",
  m1886: "Matrikkelen av 1886 er en oversikt over jordeiendommer i hele landet, angitt med navn, matrikkelnummer og verdi. Som noe nytt ble gardsnummer og bruksnummer tatt i bruk. Alle landets fylker, untatt Finnmark er dekket, og for hvert bruksnummer er angitt gards- og bruksnavn, i alt nesten 208 000 matrikler. Matrikelen regnes for å være den første moderne matrikkel, fastsatt etter det systemet vi kjenner i dag.",
  mu1950: "Matrikkelutkastet av 1950 var forberedelsen til en ny matrikkel for hele Norge, men oppgaven ble aldri fullført, og man brukte i stedet kommunale eiendomsregistre. Utkastet dekker samlet sett over 767 000 matrikler fra landkommunene i alle fylker unntatt Finnmark. Hver matrikkel er angitt med gards- og bruksnavn, matrikkelnummer og verdi.",
  skul: "Skulebarnsoppskriftene var en landsdekkende dugnad i perioden 1931-1935, der skoleelever samlet inn stedsnavn fra egne bruk. Det ble samlet inn stedsnavn fra i alt 9700 matrikkelgårder i 13 fylker. Innsamlingsprosjektet ble organisert av navnegranskeren Gustav Indrebø (1889 - 1942), og omfatter totalt over 1 million navn. Dette datasettet omfatter inntil videre alene fylkene Nordland og Troms.",
  sof: "Stadnamnsamlinga frå Fylkesarkivet i Sogn og Fjordane, no overført til Fylkesarkivet i Vestland, er resultatet av ei stor innsamling på åttitalet frå Sogn og Fjordane og Møre og Romsdal. Supplerande innsamlingar vert òg foretatt i enkelte kommunar seinare.",
  tot: "Totennavn er en samling av navn på garder, bruk, småbruk, forsvunne stedsnavn, skogteiger og jorder fra hele Toten. Materialet baserer seg på kjeldemateriale samlet inn til Norsk stedsnavnarkiv ved Universitetet i Oslo. Arbeidet er utført av Trond Nygård på oppdrag for daværende Seksjon for navnegransking. Prosjektet ble sluttført i 2007. Kartfesting er uført på Språksamlingane i 2024.", 
  ssr2016: "Datasettet Sentralt stadnamnregister 2016 bygger på kartverkets første gratis stadnamndatasett, opprinneleg lansert i 2000. Stadnamna var del av søkjetenesta Norgesglaset, der det var mogleg at søkja på alle gateadresser i Noreg eller i ca. 700 000 stadnamn. Kartgrunnlaget til stadnamndatasettet var fem landsdekkjande kartseriar i målestokkane 1:2 millionar, 1:1 million, 1:250 000, 1:50 000 og 1:5 000. Norgesglaset vart i 2015 erstatta av tenesta Norgeskart og i 2016 vart det noverande SSR lansert med ny datastruktur.",
  ssr2020: "Sentralt stadnamnregister (SSR), Kartverkets offisielle register over stadnamn i Noreg.",
  nrk: "NRKs gamle stadnamnarkiv vart laga rundt 1960. Arkivet har tilrådd uttale for 2000 ulike stadnamn i Noreg. I datasettet finn du tilrådd uttale frå det gamle arkivet. Ver merksam på at uttale av stadnamn kan endre seg over tid, og at uttalen som var tilrådd på 1960-talet ikkje nødvendigvis samsvarar med uttalen i dag.",
  m2010: "Datasettet Matrikkelen 2010 er basert på GAB-registeret (Grunneiendom-, adresse- og bygnings-registeret) - eit offentleg register over faste eigedomar i Noreg. Registeret vart ført av Statens kartverk for kvar kommune med opplysningar om alle grunneigedomar, festegrunnar som hadde eige grunnboksblad i tinglysingsregisteret, samt anna som hadde eige grunnboksblad, til dømes eigarseksjonar. I tillegg til eigedomen si nemning og stadfesting inneheldt GAB-registeret opplysningar om kva for ein eigedom den var utskild frå, arealet, eigarforhold, adresse og bygningsdata. GAB-registeret er i dag avløyst av matrikkelen.",
  gn2019: "GeoNames er ein brukarstyrt geografisk database grunnlagt i 2005 og tilgjengeleg via ulike netttenester under Creative Commons-lisens Wikipedia. Databasen inneheld over 25 millionar geografiske namn for meir enn 11,8 millionar unike stader globalt, med meir enn 600.000 norske stadnamn. Data inkluderer stadnamn på fleire språk, koordinatar, høgde over havet, folketal, administrative inndelingar og postnummer. Alle koordinatar brukar World Geodetic System 1984 (WGS84). Brukarar kan redigere og forbetre databasen gjennom eit wiki-grensesnitt Geonames, noko som gjer GeoNames til eit levande og stadig oppdatert geografisk oppslagsverk. Dette datasettet er basert på eit uttrekk frå 2019, men oppdaterast jevnleg.",
  ft1900: "Folketeljinga 1900 vart gjennomført 3. desember 1900 i Noreg, då landet hadde 2 239 880 personar som heimehøyrande folkemengd. Heile befolkninga skulle registrerast der kvar enkelt oppheldt seg. Datamaterialet inneheld omtrent 160 000 stadnamn. Folketeljinga er oppbevart i statsarkiva, er fullstendig mikrofilma og tilgjengeleg i skanna og søkbar form i Digitalarkivet. Statistikken viser befolkningsoversikt fordelt på byar, heradskommunar og amt, der både landdistrikt og byar er inkludert for kvart amt. Folketeljinga er oppbevart i statsarkiva og er òg i si heilheit tilgjengeleg i søkbar form i Digitalarkivet.",
  ft1910: "Folketeljinga 1910 vart gjennomført 1. desember 1910 i Noreg, då landet hadde 2 391 782 heimehøyrande innbyggjarar. Datamaterialet inneheld omtrent 175 000 stadnamn. For første gong vart befolkninga beden om å oppgi statsborgarskap i stadet, omtrent 41 000 personar, der tre fjerdedelar var svenske. Statistikken viser befolkningsoversikt fordelt på byar, heradskommunar og amt, der både landdistrikt og byar er inkludert for kvart amt. Folketeljinga er oppbevart i statsarkiva og er òg i si heilheit tilgjengeleg i søkbar form i Digitalarkivet, publisert då tausheitsplikta på 100 år opphøyrde i 2010.",
  frogn: "",
  gjerd: "",
  sorum: "",
  kven: "Datasettet kvenske stedsnavn dokumenterer navnetradisjoner i Troms og Finnmark som vitner om flere hundre års bosetting og kulturell tilhørighet. Kvensk stedsnavntjeneste – Paikannimipalvelus redigerer og oppdaterer databasen som del av Språkrådets stedsnavntjeneste. Områdene med kvenske stedsnavn har oftest flerspråklig navnebruk med kvenske, samiske og norske navn. Datasettet inneholder nærmere 8500 navneartikler. Viktige kilder er Sentralt stedsnavnregister (SSR) med 4-5000 kvenske navn og ca. 12.400 navnesedler innsamlet av finske forskere mellom 1970-1990, oppbevart i Namnarkivet i Helsingfors med kopier ved Universitetet i Tromsø og Kvensk stedsnavntjeneste.",
  snor: "Er eit landsdekkande datasett knytt til tilskotsordninga for innsamling og registrering av stadnamn. Databasen inneheld om lag 170 000 norske, samiske og kvenske stadnamn, og vart oppretta for å ta vare på og registrere stadnamn som elles ville gå tapt. Per 2025 inneheld basen namn frå 158 kommunar, der meir enn 95 kommunar har over 50 registrerte namn kvar. Alle innsamlings- og registreringsprosjekt som får støtte gjennom tilskotsordninga, må leggje inn stadnamna i denne databasen.",
  herad: "Heradsregisteret er ei omfattande samling i Norsk stadnamnarkiv som inneheld om lag 400.000 stadnamn frå heile Noreg. Kvar oppslag i registeret inneheld informasjon om namnet, uttalen, administrativ tilhøyrsle og kartreferansar. Tilleggsinformasjon om namnet eller lokaliteten er vanleg.Samlinga var grunnstammen i \"Den nasjonale stedsnavnbasen\". Samlinga bidrar med unik dokumentasjon av norske stadnamn.",
  seta: "Seternamnakrivet er ei omfattande samling som inneheld 50.000 namn på setrar. Samlinga var opprinneleg organisert i to seddelsamlingar — ei ordna etter herad og ei for heile landet. Registeret vart skanna i samband med Dokumentasjonsprosjektet og gjekk i skanna versjon som del av \"Den nasjonale stadnamnbasen\"."
}


export const datasetShortDescriptions: Record<string, string> = {
  search: "Stadnamnsøk er Språksamlinganes overordna søk, som samanstiller data frå ei rekke datasett og slår saman resultat med tilnærma same namn. Oppslag i dei einskilde datasetta blir her lista opp som kjelder.",
  all: "Søk på tvers av grunnlagsdatasetta. Merk at dette søket kan vere tregare enn stadnamnsøk, og felta er ikkje like standardiserte. Det er derfor meist eigna til å samanlikne eit utval datasett på felt som overlappar.",
  bsn: "Opprettet på 1950-tallet, inneholder informasjon om navn på omtrent 190 000 bosteder fra ti fylker i Norge.",
  hord: "Ei samling av 179 000 stadnamn frå tidlegare Hordaland fylke, inkludert små namn for åkrar, utmark, lier, tjørn og fjell.",
  rygh: "Digitalisert utgave av Oluf Ryghs standardverk for stedsnavn i Norge, opprinnelig utgitt i 18 bind i årene 1897-1924.",
  ostf: "En 20-binds serie utgitt mellom 1994 og 2021, som dekker bosetningsnavn i det tidligere Østfold fylke.",
  leks: "Digital utgåve av Norsk Stadnamnleksikon (1997) som forklarar opphavet til viktige stadnamn i Noreg, inkludert norske, samiske og kvenske namn, samt administrative inndelingar.",
  //nbas: "Inneholder omtrent 700 000 navn fra ulike samlinger, der hvert navnekort inkluderer navneformen, uttalen og informasjon om kommunen og fylket.",
  m1838: "Norges første omfattende matrikkel fra 1800-tallet, som dekker hele landet unntatt Finnmark.",
  mu1950: "Utkast til en ny nasjonal matrikkel som aldri ble fullført. Den dekket over 767 000 oppføringer av eiendommer fra landkommuner.",
  m1886: "Regnes som Norges første moderne matrikkel, og introduserte gårds- og bruksnumre for hele landet bortsett fra Finnmark.",
  skul: "Eit landsdekkjande prosjekt frå 1931–1935 der skulebarn samla inn over 1 million stadnamn frå 9 700 registrerte gardar i 13 fylke.",
  sof: "Eit omfattande materiale som er resultatet av ei stor innsamling av stadnamn på 1980-talet frå Sogn og Fjordane og Møre og Romsdal.",
  tot: "En samling av ulike stedsnavn fra Toten-regionen, basert på kildemateriale samlet inn for Norsk stadnamnarkiv ved Universitetet i Oslo.",
  ssr2016: "Basert på Kartverket sitt første frie stadnamndatasett frå 2000. Databasen var i bruk fram til 2016 då Kartverket si noverande datastruktur vart lansert.",
  ssr2020: "Kartverkets offisielle register over stadnamn i Noreg.",
  nrk: "NRKs stadnamnarkiv frå 1960 inneheld tilrådd uttale for 2000 stadnamn i Noreg. Uttalen kan ha endra seg sidan den gong.",
  m2010: "Eit datasett basert på GAB-registeret (Grunneiendom-, adresse- og bygnings-registeret), som var eit offentleg register over faste eigedomar i Noreg.",
  gn2019: "GeoNames 2019 gir over 600 000 norske stedsnavn med koordinater, høgde, administrative inndelinger og språkvarianter.",
  ft1900: "Folketellingen 1900 inneholder ca. 160 000 stedsnavn brukt i befolkningsstatistikk, tilgjengelig i Digitalarkivet.",
  ft1910: "Folketellingen 1910 inneholder ca. 175 000 stedsnavn og informasjon om statsborgerskap, tilgjengelig i Digitalarkivet.",
  frogn: "",
  gjerd: "",
  sorum: "",
  kven: "Kvenske stedsnavn fra Troms og Finnmark, med nær 8 500 navneartikler fra SSR og finske forskere, og flerspråklig navnebruk.",
  snor: "Datasettet knytt til tilskotsordninga for innsamling og registrering av stadnamn. Databasen inneheld om lag 170 000 norske, samiske og kvenske stadnamn, og vart oppretta for å ta vare på og registrere stadnamn som elles ville gå tapt.",
  herad: "Heradsregisteret er ein del av Norsk stadnamnarkiv, og var grunnstammen i \"Den nasjonale stadnamnbasen\" utvikla ved UiO",
  seta: "Seternamnarkivet inneholder 50 000 navn på setrer fra hele landet, digitalisert fra to historiske kortsamlinger."
}


export const publishDates: Record<string, string> = {
  bsn: "2024-05-29",
  hord: "2024-02-07",
  rygh: "2024-05-29",
  //nbas: "2024-05-29",
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
  ssr2020: "2025-03-04",
  nrk: "2025-03-06",
  gn2019: "2025-03-13",
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


export const licenses: Record<string, {name: string, url: string}> = {
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
      search: {
        img: "icon.svg",
        alt: "Kart over Norge med stedsnavn",
        imageAttribution: "Kartverket",
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      all: {
        img: "icon.svg",
        alt: "Kart over Norge med stedsnavn",
        imageAttribution: "Kartverket",
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      bsn: {
        img: "/datasets/ubb-spr-bp-0001_sm.jpg",
        alt: "En kvinnelig arkivar eller kontorist sitter ved et skrivebord foran en stor rekke arkivskuffer.",
        imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen",
        attribution: "Språksamlingene", 
        license: licenses.ccby4
      },
      hord: {
        img: "/datasets/3037_general_7_1925_jpg300dpi.jpg",
        alt: "Utsnitt av kart over Hordaland og Sogn og Fjordane",
        imageAttribution: "Kartverket: Generalkart VII, L. Arentz 1929",
        attribution: "Institutt for lingvistiske, litterære og estetiske studier. Berika av Språksamlingane", 
        license: licenses.ccby4,
      },
      rygh: {
        img: "/datasets/Prof_oluf_rygh.jpg",
        alt: "Oluf Rygh, portrettfoto",
        imageAttribution: "Norges geografiske oppmåling; retusjering: J. Nordhagen.",
        attribution: "Riksarkivet og Dokumentasjonsprosjektet. Beriket av Språksamlingene", 
        license: licenses.ccby4,
      },
      ostf: {
        img: "/datasets/Østfold_gml_herredsinndeling.png",
        alt: "Verket bygger på den gamle herredsinndelinga i Østfold",
        imageAttribution: "Bustadnavn i Østfold",
        attribution: "Kåre Hoel, Margit Harsson og Tom Schmidt. Beriket av Språksamlingene", 
        license: licenses.ccby4,
      },
      leks: {
        img: "/datasets/leks2.png",
        alt: "Forside til Norsk stadnamnleksikon 1997",
        imageAttribution: "Skanna av Språksamlingane",
        license: licenses.ccby4,
        attribution: "Berit Sandnes. Berika av Språksamlingane", 
        subindices: {
          leks_g: {
            initMode: "list",
            icon: "base"
        }},
      },      
      /*
      nbas: {
        img: "/datasets/vincent-botta-wYD_wfifJVs-unsplash.jpg",
        imageAttribution: "Vincent Botta, Unsplash.com",
        alt: "Harddisk",
        license: licenses.ccby4,
        attribution: "Språksamlingene",
        //subindices: {
        //  nbas_k: {
        //    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
        //  }
        //},
      },
      */
      m1838: {
        img: "/datasets/Matrikkelen_1838_Bykle_anneks_utsnitt.jpg",
        alt: "Utsnitt fra Matrikkelen 1838, Bykle anneks",
        imageAttribution: "Aust-Agder fylke, Nedenæs amt, Matrikkel , 1838-, oppb: Riksarkivet",
        attribution: "Riksarkivet og Registreringssentral for historiske data, UiT. Beriket av Språksamlingene", 
        license: licenses.ccby4,
      },
      m1886: {
        img: "/datasets/No-nb_digibok_2014010838007_0180_1.jpg",
        alt: "Den forberedende matrikkelkommisjonen i Kråkstad i 1864",
        imageAttribution: "Østlid, Martin. \"Kråkstad\", s. 180 (nb.no)",
        attribution: "Riksarkivet og Registreringssentral for historiske data, UiT. Beriket av Språksamlingene", 
        license: licenses.ccby4,
      },
      mu1950: {
        img: "/datasets/6541_inndeling_s_1950_jpg300dpi.jpg",
        alt: "Herredskart 1950",
        imageAttribution: "Kartverket, kommunneinndelinger 1950",
        attribution: "Språksamlingene, opprinnelig digitalisert av Dokumentasjonsprosjektet", 
        license: licenses.ccby4,
      },
      skul: {
        img: "/datasets/ubb-kk-n-520-005_sm.jpg",
        alt: "Interiør fra klasserom, jenteklasse",
        imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen",
        attribution: "Språksamlingene", 
        license: licenses.ccby4,
      },
      sof: {
        img: "/datasets/SOF.JPG",
        alt: "Utbreiingskart over Fylkesarkivet sine stadnamnsamlingar",
        imageAttribution: "Fylkesarkivet i Vestland",
        attribution: "Fylkesarkivet i Vestland. Berika av Språksamlingane", 
        license: licenses.ccby4,
        links: [{title: "Nettstad: ", href: "https://www.fylkesarkivet.no/stadnamn.380535.no.html"}]
      },
      tot: {
        img: "/datasets/toten.png",
        alt: "Historisk fotografi med garder og bruk ved Einavatnet.",
        imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen",
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      ssr2016: {
        img: "/datasets/Logo ståande, WEB-fargar.svg",
        alt: "Kartverkets logo",
        imageAttribution: "Statens kartverk",
        attribution: "Statens kartverk og Språksamlingane",
        license: licenses.ccby4,
      },
      ssr2020: {
        img: "/datasets/Logo ståande, WEB-fargar.svg",
        alt: "Kartverkets logo",
        imageAttribution: "Statens kartverk",
        attribution: "Statens kartverk og Språksamlingane",
        license: licenses.ccby4,
      },
      nrk: {
        img: "/datasets/Norsk-rikskringkasting-Logo.svg",
        alt: "NRKs logo",
        imageAttribution: "	Norsk rikskringkasting",
        attribution: "NRK",
        license: licenses.ccby4,
      },
      gn2019: {
        img: "/datasets/geonames_logo_icon_171110.svg",
        alt: "Geonames",
        imageAttribution: "Geonames",
        attribution: "Geonames",
        license: licenses.ccby4,
      },
      ft1900: {
        img: "/datasets/042sAXjQ1pbw.jpg",
        alt: "Punchedamer i arbeid i Statistisk Centralbureau ved folketellingen 1900",
        imageAttribution: "Foto: Colditz, Caroline",
        imageUrl: {"name": "oslobilder.no", "url": "http://www.oslobilder.no/NTM/NTM%20C%2011164"},
        imageLicense: licenses.ccbyncsa3,
        attribution: "Statistisk sentralbyrå, beriket av Språksamlingene",
        license: licenses.ccby4,
      },
      ft1910: {
        img: "/datasets/ft1910.png",
        alt: "Foto: Ukjent ca 1900-1910",
        imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen",
        imageUrl: {"name": "marcus.uib.no", "url": "https://marcus.uib.no/instance/photograph/ubb-bros-04220"},
        attribution: "Statistisk sentralbyrå, beriket av Språksamlingene",
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
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      gjerd: {
        img: "/datasets/Gjerdrum_komm.svg",
        alt: "Våpen for Gjerdrum kommune i Akershus fylke",
        imageAttribution: "",
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      sorum: {
        img: "/datasets/Sørum_komm.svg",
        alt: "Våpen for Sørum kommune i Akershus fylke",
        imageAttribution: "",
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      kven: {
        img: "/datasets/Flag_of_the_Kven_people.svg",
        alt: "Kvenske stedsnavn",
        imageAttribution: "",
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      snor: {
        img: "/datasets/idD1wneqED_logos.svg",
        alt: "Språkrådets logo",
        imageAttribution: "Språkrådet",
        attribution: "Språkrådet og Språksamlingene",
        license: licenses.ccby4,
      },
      herad: {
        img: "/datasets/Akersdalen_(1949).jpg",
        alt: "Akersdalen (senere kalt Groruddalen), omtrent på den tiden Aker ble innlemmet i Oslo.",
        imageAttribution: "Oslo byarkiv, Wikimedia Commons",
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      seta: {
        img: "/datasets/ubb-kk-ncn-0275_md.jpg",
        alt: "Stølen til gården Seim i Grøndalen, Røldal.",
        imageAttribution: "Foto: Knud Knudsen. Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen",
        imageUrl: {"name": "marcus.uib.no", "url": "https://marcus.uib.no/instance/photograph/ubb-kk-ncn-0275"},
        attribution: "Språksamlingene",
        license: licenses.ccby4,
      },
      wikid: {
        img: "/datasets/Wikidata-logo.svg",
        alt: "Wikidata",
        imageAttribution: "Wikimedia Foundation",
        attribution: "Wikidata",
        license: licenses.ccby4,
      },
      osm: {
        img: "/datasets/osm.png",
        alt: "Kartutsnitt fra OpenStreetMap",
        imageAttribution: "OpenStreetMap",
        attribution: "OpenStreetMap",
        license: licenses.ccby4,
      }
}

export const subpages: Record<string, string[]> = {
  leks: ["Nokre ord om nemningar, namngjeving og namnegransking", "Område- og bygdenamn", "Gards- og andre bustadnamn", "Elvenamn", "Innsjønamn", "Fjordnamn", "Øynamn", "Fjellnamn", "Seternamn" ]
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
  "sprak": "Språksamlinganes arkiv", // Fysisk materiale oppbevart i Språksamlingene
  "encyclopedia": "Oppslagsverk",
  "database": "Database",
  "public": "Offentleg register",
  "collection": "Djupinnsamling", // Toponomastic collection
}




export const datasetFeatures: Record<string, string[]> = {
  bsn: ["image", "digi"],
  hord: ["audio", "coordinates", "phonetic", "digi"],
  rygh: ["phonetic", "digi"],
  m1838: ["link"],
  m1886: ["link"],
  mu1950: ["link"],
  skul: ["image", "digi"],
  leks: ["phonetic", "base", "digi"],
  ostf: ["link"],
  sof: ["link", "coordinates", "phonetic"],
  tot: ["phonetic"],
  ssr2016: ["link"],
  ssr2020: ["link"],
  nrk: ["phonetic", "image", "digi"],
  gn2019: ["link"],
  frogn: ["phonetic"],
  gjerd: ["phonetic"],
  sorum: ["phonetic"],
  herad: ["image", "digi"],
  seta: ["image", "digi"]
}

export const datasetTypes: Record<string, string[]> = {
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
  ssr2020: ["database", "public"],
  nrk: ["database", "collection"],
  gn2019: ["database"],
  m2010: ["database", "public"],
  gjerd: ["collection"],
  sorum: ["collection"],
  frogn: ["collection"],
  kven: ["database"],
  snor: ["database", "collection"],
}

