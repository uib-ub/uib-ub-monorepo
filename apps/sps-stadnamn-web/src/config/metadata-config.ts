export interface DatasetTitles {
  [key: string]: string;
}

export interface SubindexPresentation {
  [key: string]: {
    img?: string;
    alt?: string;
    imageAttribution?: string;
    description?: string;
    initPage?: string;
  }
}

export interface DatasetPresentation {
  [key: string]: {
    img: string;
    alt: string;
    imageAttribution: string;
    license: {name: string, url: string};
    attribution: string;
    links?: {title?: string, href: string, text?: string}[];
    subindices?: SubindexPresentation;
    initPage?: string;
  }
}

export const datasetTitles: DatasetTitles = {
    bsn: "Bustadnavnregisteret",
    hord: "Hordanamn",
    rygh: "Norske Gaardnavne",
    nbas: "Den nasjonale stadnamnbasen",
    nbas_k: "innsamlingskart",
    m1838: "Matrikkelen 1838", 
    m1886: "Matrikkelen av 1886",
    mu1950: "Matrikkelutkastet 1950", 
    search: "Stadnamnsøk",
    skul: "Skulebarnsoppskriftene",
    leks: "Norsk stadnamnleksikon",
    leks_g: "grunnord",
    ostf: "Bustadnavn i Østfold",
    sof: "Fylkesarkivet i Sogn og Fjordane",
    tot: "Totennavn",
    ssr2016: "Kartverket 2016",
}

export const datasetDescriptions: Record<string, string> = {
  bsn: "Bustadnavnregisteret ble skapt på 1950-talet inneholder informasjon om navn på ca 190 000 bosteder (garder, bruk og plasser) fra ti fylker i landet. Registeret består av ca. 109 000 arkivsedler. Hver seddel inneholder også informasjon om fylke, kommune, gardsnummer og bruksnummer. Stedene er georeferert utifra kartverkets moderne matrikkel - så nøyaktig som mulig.",
  hord: "Hordanamn er ei samling av stadnamn, især smånamn på åkrar, utmark, lier, tjern og fjell, m.m. I alt 179 000 stadnamn frå det tidligere Hordaland fylke er å finne i samlingen, fordelt på rundt 185 000 oppslag. Det er mulig å se informasjon om hvert stadnamn og se plasseringen til namnet i kartet. Uttale er ofte angitt og i mange tilfelle er det òg mogleg å lytte til den lokale uttalen.",
  rygh: "Norske Gaardnavne er en digital utgivelse av bebyggelsesnavn fra hele Norge, unntatt Finnmark. Utgivelsen omfatter om lag 69 000 bostedsnavn, derav ca. 3 700 navnegardsnavn, 44 500 gardsnavn, 16 000 bruksnavn, 4 000 forsvunne navn og 1 000 navn på sokn og herreder. Hvert gardsnavn er angitt med uttale og følges historisk ned gjennom tidene og med en språklig tolkning.",
  ostf: `Bustadnavn i Østfold er en utgivelse over bebyggelsesnavna (bustadnavna) i Østfold herredsvis (22 herred etter den gamle inndelinga). Navneforskerne Tom Schmidt og Margit Harsson ved Seksjon for navnegransking (UiO) sto for redigering og utgiving av serien, som bygger på et originalmanus av navnegranskeren Kåre Hoel (1922-1989), en navnegranskerkollega. Serien ble utgitt mellom 1994 og 2021 og består av i alt 20 bind. Verket er en sterkt utvidet og revidert utgave av Oluf Ryghs Norske Gaardnavne (bind 1 Smaalenenes Amt, 1897). Rygh begrenset seg i all hovedsak til navn på matrikkelgårdene, men nå er også navn på andre bebyggelser tatt opp til drøfting, samtidig som gårdsnavnene gis en fyldig behandling - både språklig og kulturhistorisk.`,
  leks: "Norsk stadnamnleksikon er ei digital utgiving av stadnamn frå heile Noreg og er eit søk som gir forklaring på opphavet av viktige stadnamn i Noreg. Det er mogleg å søkja på både enkeltnamn og dei viktigaste grunnorda. Verket inneheld både norske, samiske og kvenske namn og samstundes alle administrative inndelingane i Noreg frå før 2020. Den digitale Norsk stadnamnleksikon er ei vidareføring av siste trykte utgåve frå 1997.",
  nbas: "Den nasjonale stedsnavnbasen inneholder om lag 700 000 navn totalt (fordelte på kortsamlinger fra herredsregistret, seternavnregisteret, en del enkeltsamlinger, og stedsnavnsamlingen ved Universitetet i Bergen. Hvert navnekort inneholder navneform, uttale og informasjon om tilhørighet til kommune og fylke. I mange tilfelder er også gardsnummer oppgitt. I tillegg inneholder basen 3 700 originale innsamlingskart.",
  m1838: "Matrikkelen av 1838 er et landsomfattende register over jordeiendommer og deres navn og verdi. Dette var den første nye matrikkel siden 1665. Registeret omfatter nesten 43 000 garder og 110 000 bruk, alle angitt navn, matrikkel- og løpenummer. Matrikkelen er landets første helnorske matrikkel og dekker hele landet unntatt Finnmark, der ikke ble matrikulert før enn godt 150 år senere.",
  m1886: "Matrikkelen av 1886 er en oversikt over jordeiendommer i hele landet, angitt med navn, matrikkelnummer og verdi. Som noe nytt ble gardsnummer og bruksnummer tatt i bruk. Alle landets fylker, untatt Finnmark er dekket, og for hvert bruksnummer er angitt gards- og bruksnavn, i alt nesten 208 000 matrikler. Matrikelen regnes for å være den første moderne matrikkel, fastsatt etter det systemet vi kjenner i dag.",
  mu1950: "Matrikkelutkastet av 1950 var forberedelsen til en ny matrikkel for hele Norge, men oppgaven ble aldri fullført, og man brukte i stedet kommunale eiendomsregistre. Utkastet dekker samlet sett over 767 000 matrikler fra landkommunene i alle fylker unntatt Finnmark. Hver matrikkel er angitt med gards- og bruksnavn, matrikkelnummer og verdi.",
  skul: "Skulebarnsoppskriftene var en landsdekkende dugnad i perioden 1931-1935, der skoleelever samlet inn stedsnavn fra egne bruk. Det ble samlet inn stedsnavn fra i alt 9700 matrikkelgårder i 13 fylker. Innsamlingsprosjektet ble organisert av navnegranskeren Gustav Indrebø (1889 - 1942), og omfatter totalt over 1 million navn. Dette datasettet omfatter inntil videre alene fylkene Nordland og Troms.",
  sof: "Stadnamnsamlinga frå Fylkesarkivet i Sogn og Fjordane, no overført til Fylkesarkivet i Vestland, er resultatet av ei stor innsamling på åttitalet frå Sogn og Fjordane og Møre og Romsdal. Supplerande innsamlingar vert òg foretatt i enkelte kommunar seinare.",
  tot: "Totennavn er en samling av navn på garder, bruk, småbruk, forsvunne stedsnavn, skogteiger og jorder fra hele Toten. Materialet baserer seg på kjeldemateriale samlet inn til Norsk stedsnavnarkiv ved Universitetet i Oslo. Arbeidet er utført av Trond Nygård på oppdrag for daværende Seksjon for navnegransking. Prosjektet ble sluttført i 2007. Kartfesting er uført på Språksamlingane i 2024.", 
  ssr2016: "Datasettet Sentralt stadnamnregister 2016 bygger på kartverkets første gratis stadnamndatasett, opprinneleg lansert i 2000. Stadnamna var del av søkjetenesta Norgesglaset, der det var mogleg at søkja på alle gateadresser i Noreg eller i ca. 700 000 stadnamn. Kartgrunnlaget til stadnamndatasettet var fem landsdekkjande kartseriar i målestokkane 1:2 millionar, 1:1 million, 1:250 000, 1:50 000 og 1:5 000. Norgesglaset vart i 2015 erstatta av tenesta Norgeskart og i 2016 vart det noverande SSR lansert med ny datastruktur."
}


export const datasetShortDescriptions: Record<string, string> = {
  search: "Overordna søk aggregert frå alle datasett",
  bsn: "Opprettet på 1950-tallet, inneholder informasjon om navn på omtrent 190 000 bosteder fra ti fylker i Norge.",
  hord: "Ei samling av 179 000 stadnamn frå tidlegare Hordaland fylke, inkludert små namn for åkrar, utmark, lier, tjørn og fjell.",
  rygh: "En digital publikasjon av omtrent 69 000 bosetningsnavn fra hele Norge unntatt Finnmark, inkludert historiske og språklige tolkninger",
  ostf: "En 20-binds serie utgitt mellom 1994 og 2021, som dekker bosetningsnavn i det tidligere Østfold fylke.",
  leks: "Er ei digital utgåve som forklarar opphavet til viktige stadnamn i Noreg, inkludert norske, samiske og kvenske namn, samt administrative inndelingar.",
  nbas: "Inneholder omtrent 700 000 navn fra ulike samlinger, der hvert navnekort inkluderer navneformen, uttalen og informasjon om kommunen og fylket.",
  m1838: "Norges første omfattende matrikkel fra 1800-tallet, som dekker hele landet unntatt Finnmark.",
  mu1950: "Utkast til en ny nasjonal matrikkel som aldri ble fullført. Den dekket over 767 000 oppføringer av eiendommer fra landkommuner.",
  m1886: "Regnes som Norges første moderne og introduserte gårds- og bruksnumre for hele landet bort sett fra Finnmark.",
  skul: "Eit landsdekkjande prosjekt frå 1931–1935 der skulebarn samla inn over 1 million stadnamn frå 9 700 registrerte gardar i 13 fylke.",
  sof: "Eit omfattande materiale som er resultatet av ei stor innsamling av stadnamn på 1980-talet frå Sogn og Fjordane og Møre og Romsdal.",
  tot: "En samling av ulike stedsnavn fra Toten-regionen, basert på kildemateriale samlet inn for Norsk stadnamnarkiv ved Universitetet i Oslo.",
  ssr2016: "Basert på Kartverket sitt første frie stadnamndatasett frå 2000. Databasen var i bruk fram til 2016 då Kartverket si noverande datastruktur vart lansert."
}


export const publishDates: Record<string, string> = {
  bsn: "2024-05-29",
  hord: "2024-02-07",
  rygh: "2024-05-29",
  nbas: "2024-05-29",
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
}



export const licenses: Record<string, {name: string, url: string}> = {
  ccby4: {
    name: "CC BY 4.0",
    url: "https://creativecommons.org/licenses/by/4.0/deed.no"
  },
  }



export const datasetPresentation: DatasetPresentation = {
      search: {
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
        attribution: "Kåre Hoel, Margit Harson og Tom Schmidt. Beriket av Språksamlingene", 
        license: licenses.ccby4,
      },
      leks: {
        img: "/datasets/leks2.png",
        alt: "Forside til Norsk stadnamnleksikon 1997",
        imageAttribution: "Skanna av Språksamlingane",
        license: licenses.ccby4,
        attribution: "Berit Sandnes. Berika av Språksamlingane", 
        initPage: "info",
        subindices: {
          leks_g: {
            initPage: "info",
        }},
      },      
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
        img: "/datasets/ssr2016.png",
        alt: "Kartutsnitt over Kartverket",
        imageAttribution: "Statens kartverk",
        attribution: "Statens kartverk og Språksamlingane",
        license: licenses.ccby4,
      },

}

export const subpages: Record<string, string[]> = {
  leks: ["Nokre ord om nemningar, namngjeving og namnegransking", "Område- og bygdenamn", "Gards- og andre bustadnamn", "Elvenamn", "Innsjønamn", "Fjordnamn", "Øynamn", "Fjellnamn", "Seternamn" ]
}

export const featureNames: Record<string, string> = {
  "image": "Sedler",
  "image_tmp": "Sedler (kommer)",
  "audio": "Lydopptak",
  "phonetic": "Lydskrift",
  "coordinates": "Koordinater",
  "link": "Lenker",
  "maps": "Skannede kart",
  "base": "Grunnord",
  "prep": "Preposisjoner",
}

export const typeNames: Record<string, string> = {
  "sprak": "Språksamlingenes arkiv",
  "encyclopedia": "Oppslagsverk",
  "database": "Database",
  "public": "Offentlig register",
}




export const datasetFeatures: Record<string, string[]> = {
  bsn: ["image"],
  hord: ["audio", "coordinates", "phonetic"],
  rygh: ["phonetic"],
  nbas: ["image", "maps"],
  m1838: ["link"],
  m1886: ["link"],
  mu1950: ["link"],
  skul: ["image_tmp"],
  leks: ["phonetic", "base"],
  ostf: ["link"],
  sof: ["link", "coordinates", "phonetic"],
  tot: ["phonetic"],
  ssr2016: ["link"],
}

export const datasetTypes: Record<string, string[]> = {
  bsn: ["sprak"],
  hord: ["sprak", "database"],
  rygh: ["encyclopedia"],
  nbas: ["sprak", "database"],
  m1838: ["public"],
  m1886: ["public"],
  mu1950: ["public", "sprak"],
  skul: ["sprak"],
  leks: ["encyclopedia"],
  ostf: ["encyclopedia"],
  sof: ["database"],
  tot: ["database", "sprak"],
  ssr2016: ["database"],
}

