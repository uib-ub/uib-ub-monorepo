import UiBLogo from "@/components/svg/UiBLogo"
import { PiMapTrifold } from 'react-icons/pi';
import Link from 'next/link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import IconButton from '@/components/ui/icon-button';
import Image from 'next/image';

export default function Home() {
  const cards = [
    { img: "/datasets/ubb-spr-bp-0001_sm.jpg", imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen", title: "Bustadnavnregisteret", code: 'bsn', 
    description: `Bustadnavnregisteret ble skapt på 1950-talet inneholder informasjon om navn på ca 190 000 bosteder (garder, bruk og plasser) fra ti fylker i landet. Registeret består av ca. 109 000 arkivseddler. Hver seddel inneholder også informasjon om fylke, kommune, gardsnummer og bruksnummer.
    Stedene er georeferert utifra kartverkets moderne matrikkel - så nøyaktig som mulig.` },
    { img: "/datasets/3037_general_7_1925_jpg300dpi.jpg", alt: "Utsnitt av kart over Hordaland og Sogn og Fjordane", imageAttribution: "Kartverket: Generalkart VII, L. Arentz 1929", title: "Hordanamn", code: 'hord', description: "Hordanamn er en samling av stadnamn, især smånamn på åkrar, utmark, lier, tjern og fjell, m.m. I alt 179 000 stadnamn frå det tidligere Hordaland fylke er at finne i samlingen, fordelt på rundt 185 000 oppslag. Det er mulig at se informasjon om hvert stadnamn og se plasseringen til namnet i kartet. Uttale er ofte angitt og i mange tilfelle er det mulig òg at lytte til den lokale uttalen. " },
    { img: "/datasets/Prof_oluf_rygh.jpg", alt: "Oluf Rygh, portrettfoto", imageAttribution: "Wikimedia commons", title: "Oluf Rygh: Norske Gaardnavne", code:"rygh", description: "Norske Gaardnavne er en digital utgivelse av bebyggelsesnavn fra hele Norge, unntatt Finnmark. Utgivelsen omfatter om lag 69 000 bostedsnavn, derav ca. 3 700 navnegardsnavn, 44 500 gardsnavn, 16 000 bruksnavn, 4 000 forsvunne navn og 1 000 navn på sokn og herreder. Hvert gardsnavn er angitt med uttale og følges historisk ned gjennom tidene og med en språklig tolkning. " },
    { img: "/datasets/vincent-botta-wYD_wfifJVs-unsplash.jpg", imageAttribution: "Vincent Botta, Unsplash.com", alt: "Harddisk", title: "Den nasjonale stadnamnbasen", description: `Den nasjonale stedsnavnbasen inneholder om lag 700 000 navn totalt (fordelte på kortsamlinger fra herredsregistret, seternavnregisteret, en del enkeltsamlinger, og stedsnavnsamlingen ved Universitetet i Bergen. Hvert navnekort inneholder navneform, uttale og informasjon om tilhørighet til kommune og fylke. I mange tilfelder er også gardsnummer oppgitt.
    I tillegg inneholder basen 3 700 originale innsamlingskart.` },
    { img: "/datasets/No-nb_digibok_2014010838007_0180_1.jpg", imageAttribution: "Østlid, Martin. \"Kråkstad\", s. 180 (nb.no)",  title: "Matrikkelen av 1886", "code": "m1886", description: "Matrikkelen av 1886 er en oversikt over jordeiendommer i hele landet, angitt med navn, matrikkelnummer og verdi. Som noe nytt ble gardsnummer og bruksnummer tatt i bruk. Alle landets fylker, untatt Finnmark er dekket, og for hvert bruksnummer er angitt gards- og bruksnavn, i alt nesten 208 000 matrikler. Matrikelen regnes for å være den første moderne matrikkel, fastsatt etter det systemet vi kjenner i dag." },
    { img: "/datasets/6541_inndeling_s_1950_jpg300dpi.jpg", alt: "Herredskart 1950", imageAttribution: "Kartvkeret, kommunneinndelinger 1950", title: "Matrikkelutkastet av 1950", code: "mu1950", description: "Matrikkelutkastet av 1950 var forberedelsen til en ny matrikkel for hele Norge, men oppgaven ble aldri fullført, og man brukte i stedet kommunale eiendomsregistre. Utkastet dekker samlet sett over 767 000 matrikler fra landkommunene i alle fylker unntatt Finnmark. Hver matrikkel er angitt med gards- og bruksnavn, matrikkelnummer og verdi." },
    { img: "/datasets/Matrikkelen_1838_Bykle_anneks_utsnitt.jpg", imageAttribution: "Aust-Agder fylke, Nedenæs amt, Matrikkel , 1838-, oppb: Riksarkivet", title: "Matrikkelen av 1838", code: "m1838", description: "Matrikkelen av 1838 er et landsomfattende register over jordeiendommer og deres navn og verdi. Dette var den første nye matrikkel siden 1665. Registeret omfatter nesten 43 000 garder og 110 000 bruk, alle angitt navn, matrikkel- og løpenummer. Matrikkelen er landets første helnorske matrikkel og dekker hele landet unntatt Finnmark, der ikke ble matrikulert før enn godt 150 år senere." },
    { img: "", title: "Norsk stadnamnleksikon", description: "Norsk stadnamnleksikon er ein digital utgiving av stadnamn frå heile Noreg og er eit søk som gir forklaring på opphavet av viktige stadnamn i Noreg. Det er mogleg at søkja på både enkeltnamn og dei viktigaste grunnorda. Verket inneheld både norske, samiske og kvenske namn og samstundes alle administrative inndelingane i Noreg frå før 2020. Den digitale Norsk stadnamnleksikon er ei vidareføring av siste trykte utgåve frå 1997." },
    {img: "/datasets/ubb-kk-n-520-005_sm.jpg", title: "Skulebarnsoppskriftene", code: "skul", alt: "Interiør fra klasserom, jenteklasse", imageAttribution: "Avdeling for spesialsamlinger, Universitetsbiblioteket i Bergen", description: `Skulebarnsoppskriftene var en landsdekkende dugnad i perioden 1931-1935, der skoleelever samlet inn stedsnavn fra egne bruk. Det ble samlet inn stedsnavn fra i alt 9700 matrikkelgårder i 13 fylker. Innsamlingsprosjektet ble organisert av navnegranskeren Gustav Indrebø (1889 - 1942), og omfatter totalt over 1 million navn. 
    Dette datasettet omfatter inntil videre alene fylkene Nordland og Troms.` }
  ];

  return (
    <>
<main className="flex flex-col grow-1 gap-48 items-center justify-center pb-8 lg:pt-32 md:pt-16 sm:pt-8  lg:pb-16 px-4 w-full flex-grow">
  <div className="flex flex-col gap-24 w-full">
  <div className="flex flex-col gap-12 w-full">
  <div className="flex flex-col gap-6 md:items-center">
  <h1 className="text-2xl sm:text-3xl self-center text-neutral-900 md:text-4xl lg:text-5xl font-serif">Stedsnavnsøk</h1>
  
  <form className="grid grid-cols-5 md:grid-cols-7 items-center justify-center md:max-w-2xl md:mx-auto gap-2" action="search/*">

    <input className="col-span-4 rounded-sm h-full border border-gray-400 text-base px-2" name="q" type="text"/>
    <IconButton className="btn btn-primary h-full col-span-1 text-base" type="submit" label="Søk"><PiMagnifyingGlass aria-hidden='true' className="text-lg"/></IconButton>
    <button className="btn text-base col-span-5 md:col-span-2 whitespace-nowrap"><PiMapTrifold aria-hidden='true' className="mr-2"/>Utforsk kartet</button>
  </form>
  
  </div>

  </div>

  <div className="flex items-center justify-center flex-col lg:flex-row gap-12">
  <div className="flex flex-col md:flex-row items-center gap-6 text-neutral-950 "><UiBLogo/><div className="flex flex-col gap-1 text-center md:text-left"><h2 className="tracking-widest font-serif">UNIVERSITETET I BERGEN</h2><em className="font-serif">Universitetsbiblioteket</em></div>
  </div>
  <div className="flex flex-col md:flex-row gap-6 jusitfy-between text-center">
  <div className="flex flex-col"><span className="font-semibold">Språksamlingene</span>
  <Link href="https://spraksamlingane.no" className="text-sm">spraksamlingane.no</Link></div>
  <div className="flex flex-col"><span className="font-semibold">Digital utvikling</span>
  <Link href="https://uib.no/digitalutvikling" className="text-sm">uib.no/digitalutvikling</Link></div>

  </div>
  </div>
  


  </div>
  <section className="flex flex-col items-center gap-12 container" aria-labelledby="dataset_showcase">
    <h2 id="dataset_showcase" className="font-serif text-3xl">Utvalgte kilder</h2>
    <ul className="sm:grid sm:grid-cols-1 2xl:grid-cols-2 gap-6">
      {cards.map((card, index) => (
        <li key={index} className="card flex flex-col md:h-64 my-6 sm:my-0">
          <Link href={'search/' + card.code} className="flex flex-col sm:flex-row h-full w-full no-underline">
          <div className="w-full aspect-square sm:h-32 sm:w-32 sm:md:h-64 sm:md:w-64  lg:p-1 overflow-hidden sm:flex-none">
          <Image src={card.img} alt={card.alt || ''} width="512" height="512" className="object-cover w-full h-full sepia-[25%] grayscale-[50%]"/>
        </div>
          <div className="content p-4 pb-1 w-128 flex flex-col">
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p>{card.description}</p>
            {card.imageAttribution && 
            <small className="text-neutral-600 text-xs mt-auto">Illustrasjon: {card.imageAttribution}</small>
          }
          </div>
          </Link>
        </li>
      ))}
    </ul>
    <button className="btn btn-outline text-xl flex gap-2"><PiMagnifyingGlass className="text-2xl"/>Finn flere kilder</button>
    </section>
  

</main>
        <footer className="bg-neutral-200 p-6 text-center">
        
        <nav className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          <Link href="/" className="text-center px-4 py-2 w-full lg:w-auto">Tilgjengelighetserklæring</Link>
          <Link href="/" className="text-center px-4 py-2 w-full lg:w-auto">Personvern</Link>
        </nav>
        
      </footer>
      </>
  );
}
