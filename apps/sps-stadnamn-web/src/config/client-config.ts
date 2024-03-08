interface DatasetTitles {
  [key: string]: string;
}

interface SubindexPresentation {
  [key: string]: {
    img?: string;
    alt?: string;
    imageAttribution?: string;
    description?: string;
    initPage?: string;
  }
}

interface DatasetPresentation {
  [key: string]: {
    img: string;
    alt: string;
    imageAttribution: string;
    description: string;
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
    search: "Stedsnavnsøk",
    skul: "Skulebarnsoppskriftene",
    leks: "Norsk stadnamnleksikon",
    leks_g: "Norsk stadnamnleksikon - grunnord",
}



export const datasetPresentation: DatasetPresentation = {
      bsn: {
        img: "/datasets/ubb-spr-bp-0001_sm.jpg",
        alt: "En kvinnelig arkivar eller kontorist sitter ved et skrivebord foran en stor rekke arkivskuffer.",
        imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen",
        description: "Bustadnavnregisteret ble skapt på 1950-talet inneholder informasjon om navn på ca 190 000 bosteder (garder, bruk og plasser) fra ti fylker i landet. Registeret består av ca. 109 000 arkivsedler. Hver seddel inneholder også informasjon om fylke, kommune, gardsnummer og bruksnummer. Stedene er georeferert utifra kartverkets moderne matrikkel - så nøyaktig som mulig."
      },
      hord: {
        img: "/datasets/3037_general_7_1925_jpg300dpi.jpg",
        alt: "Utsnitt av kart over Hordaland og Sogn og Fjordane",
        imageAttribution: "Kartverket: Generalkart VII, L. Arentz 1929",
        description: "Hordanamn er ei samling av stadnamn, især smånamn på åkrar, utmark, lier, tjern og fjell, m.m. I alt 179 000 stadnamn frå det tidligere Hordaland fylke er at finne i samlingen, fordelt på rundt 185 000 oppslag. Det er mulig at se informasjon om hvert stadnamn og se plasseringen til namnet i kartet. Uttale er ofte angitt og i mange tilfelle er det mulig òg at lytte til den lokale uttalen."
      },
      rygh: {
        img: "/datasets/Prof_oluf_rygh.jpg",
        alt: "Oluf Rygh, portrettfoto",
        imageAttribution: "Wikimedia commons",
        description: "Norske Gaardnavne er en digital utgivelse av bebyggelsesnavn fra hele Norge, unntatt Finnmark. Utgivelsen omfatter om lag 69 000 bostedsnavn, derav ca. 3 700 navnegardsnavn, 44 500 gardsnavn, 16 000 bruksnavn, 4 000 forsvunne navn og 1 000 navn på sokn og herreder. Hvert gardsnavn er angitt med uttale og følges historisk ned gjennom tidene og med en språklig tolkning."
      },
      nbas: {
        img: "/datasets/vincent-botta-wYD_wfifJVs-unsplash.jpg",
        imageAttribution: "Vincent Botta, Unsplash.com",
        alt: "Harddisk",
        description: "Den nasjonale stedsnavnbasen inneholder om lag 700 000 navn totalt (fordelte på kortsamlinger fra herredsregistret, seternavnregisteret, en del enkeltsamlinger, og stedsnavnsamlingen ved Universitetet i Bergen. Hvert navnekort inneholder navneform, uttale og informasjon om tilhørighet til kommune og fylke. I mange tilfelder er også gardsnummer oppgitt. I tillegg inneholder basen 3 700 originale innsamlingskart.",
        subindices: {
          nbas_k: {
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
          }
        },
      },
      m1838: {
        img: "/datasets/Matrikkelen_1838_Bykle_anneks_utsnitt.jpg",
        alt: "Utsnitt fra Matrikkelen 1838, Bykle anneks",
        imageAttribution: "Aust-Agder fylke, Nedenæs amt, Matrikkel , 1838-, oppb: Riksarkivet",
        description: "Matrikkelen av 1838 er et landsomfattende register over jordeiendommer og deres navn og verdi. Dette var den første nye matrikkel siden 1665. Registeret omfatter nesten 43 000 garder og 110 000 bruk, alle angitt navn, matrikkel- og løpenummer. Matrikkelen er landets første helnorske matrikkel og dekker hele landet unntatt Finnmark, der ikke ble matrikulert før enn godt 150 år senere."
      },
      m1886: {
        img: "/datasets/No-nb_digibok_2014010838007_0180_1.jpg",
        alt: "Den forberedende matrikkelkommisjonen i Kråkstad i 1864",
        imageAttribution: "Østlid, Martin. \"Kråkstad\", s. 180 (nb.no)",
        description: "Matrikkelen av 1886 er en oversikt over jordeiendommer i hele landet, angitt med navn, matrikkelnummer og verdi. Som noe nytt ble gardsnummer og bruksnummer tatt i bruk. Alle landets fylker, untatt Finnmark er dekket, og for hvert bruksnummer er angitt gards- og bruksnavn, i alt nesten 208 000 matrikler. Matrikelen regnes for å være den første moderne matrikkel, fastsatt etter det systemet vi kjenner i dag."
      },
      mu1950: {
        img: "/datasets/6541_inndeling_s_1950_jpg300dpi.jpg",
        alt: "Herredskart 1950",
        imageAttribution: "Kartvkeret, kommunneinndelinger 1950",
        description: "Matrikkelutkastet av 1950 var forberedelsen til en ny matrikkel for hele Norge, men oppgaven ble aldri fullført, og man brukte i stedet kommunale eiendomsregistre. Utkastet dekker samlet sett over 767 000 matrikler fra landkommunene i alle fylker unntatt Finnmark. Hver matrikkel er angitt med gards- og bruksnavn, matrikkelnummer og verdi."
      },
      skul: {
        img: "/datasets/ubb-kk-n-520-005_sm.jpg",
        alt: "Interiør fra klasserom, jenteklasse",
        imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen",
        description: "Skulebarnsoppskriftene var en landsdekkende dugnad i perioden 1931-1935, der skoleelever samlet inn stedsnavn fra egne bruk. Det ble samlet inn stedsnavn fra i alt 9700 matrikkelgårder i 13 fylker. Innsamlingsprosjektet ble organisert av navnegranskeren Gustav Indrebø (1889 - 1942), og omfatter totalt over 1 million navn. Dette datasettet omfatter inntil videre alene fylkene Nordland og Troms."
      },
      leks: {
        img: "/datasets/leks2.png",
        alt: "Forside til Norsk stadnamnleksikon 1997",
        imageAttribution: "Språksamlingane",
        description: "Norsk stadnamnleksikon er ei digital utgiving av stadnamn frå heile Noreg og er eit søk som gir forklaring på opphavet av viktige stadnamn i Noreg. Det er mogleg at søkja på både enkeltnamn og dei viktigaste grunnorda. Verket inneheld både norske, samiske og kvenske namn og samstundes alle administrative inndelingane i Noreg frå før 2020. Den digitale Norsk stadnamnleksikon er ei vidareføring av siste trykte utgåve frå 1997.",
        initPage: "info",
        subindices: {
          leks_g: {
            initPage: "info",
        }},
      },
}

export const subpages: Record<string, string[]> = {
  leks: ["Nokre ord om nemningar, namngjeving og namnegransking", "Område- og bygdenamn"]
}

export const featureNames: Record<string, string> = {
  "image": "Sedler",
  "audio": "Lydopptak",
  "phonetic": "Lydskrift",
  "coordinates": "Koordinater",
  "link": "Lenker",
  "maps": "Skannede kart",
  "base": "Grunnord",
}

export const typeNames: Record<string, string> = {
  "collection": "Språksamlingenes arkiv",
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
  skul: ["image"],
  leks: ["phonetic", "base"],
}

export const datasetTypes: Record<string, string[]> = {
  bsn: ["collection"],
  hord: ["collection", "database"],
  rygh: ["encyclopedia"],
  nbas: ["collection", "database"],
  m1838: ["public"],
  m1886: ["public"],
  mu1950: ["public", "collection"],
  skul: ["collection"],
  leks: ["encyclopedia"],
}



export const facetConfig = {
    bsn: {
    }

}