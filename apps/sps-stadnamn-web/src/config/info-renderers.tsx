import Link from 'next/link';
import React, { Fragment } from 'react';
import parse from 'html-react-parser';
import { PiMagnifyingGlass } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';
import InfoPopover from '@/components/ui/info-popover';

const getUniqueAltLabels = (source: any, prefLabel: string, altLabelKeys: string[]) => {
    const altLabels = altLabelKeys.map((key) => source[key]).filter((label: string) => label !== prefLabel && label);
    return [...new Set(altLabels)].join(', ')
  }



export const infoPageRenderers: Record<string, null | ((source: any) => JSX.Element)> = {
  search: null,
  sof: null,
  rygh: (source: any) => {
    return <>
    { source.cadastre?.length > 0 &&
 <div className='flex flex-wrap gap-2'>
 
  <h3 className="font-semibold !text-base !m-0 !p-0 !font-sans">Matrikkel:</h3>
   {source.cadastre?.map((item: any, index: number) => {
    const dataset = "rygh"
    return <Fragment key={index}>
    
      <Clickable link className="no-underline flex items-center" href="/search" only={{dataset, "misc.KNR": source.misc.KNR}}>{source.misc.KNR} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></Clickable>
      { item.gnr && <>- <Clickable link className="no-underline flex items-center" href="/search" only={{dataset, "misc.Gnr": item.gnr.toString(), "misc.KNR": source.misc.KNR}}>{item.gnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></Clickable> </>}
      { item.bnr && <>{"/"} <Clickable link className="no-underline flex items-center" href="/search" only={{dataset, "misc.Bnr": item.bnr.toString(), "misc.KNR": source.misc.KNR}}>{item.bnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></Clickable> </>}
      

   </Fragment>
   })}
   </div>   
    }

    {source.content?.html && <div className="inline-flex flex-col inner-slate">
     <div className='border-b border-neutral-200 p-4'><Link href={source.link} className='whitespace-nowrap inline'>Bind {source.misc.Bind}, s. {source.misc.Side}</Link></div>
    <div className='space-y-2 inline p-4'>{parse(source.content.html)}</div>

    </div>
    }

    </>
  },
  leks_etymology: (html: string) => { // Replace when the new encyclopedia is ready
    return <>{parse(html.replace("/view/leks/doc/", "/search?dataset=leks&doc="))}</>
  },
  leks: (source: any) => {
    /*
    <InfoBox dataset={'leks'} items={[
      {title: 'Oppslagsform', value: source.label},
      {title: 'Lokalitetstype', value: source.rawData.Lokalitetstype},
      {title: 'Kommune', value: source.rawData.Kommune},
      {title: 'Kommunenummer', value: source.rawData.Kommunenr},
      {title: 'Fylke', value: source.rawData.Fylke},
      {title: 'Førsteledd', value: source.rawData.Førsteledd},
      {title: 'Sisteledd', value: source.rawData.Sisteledd},
      {title: 'StedsnavnID', 
        items: [{value: source.rawData.SNID, href: `/view/leks?rawData.snid=${encodeURIComponent(source.rawData.SNID)}`}]},
      {title: 'GNIDu', 
        items: [{value: source.rawData.GNIDu, href: `/view/leks?rawData.gnidu=${encodeURIComponent(source.rawData.GNIDu)}`}]},
      {title: 'N50 Kartid', value: source.rawData.N50_kartid}
    ]}/>

    */
    return <>
    {source.content?.html && <div className="inline-flex flex-col gap-4 inner-slate">
      <div className='border-b border-neutral-200 p-4'><Link href="https://urn.nb.no/URN:NBN:no-nb_digibok_2008121704022" className='whitespace-nowrap inline'>Norsk stadnamnleksikon 1997</Link></div>
    <div className='space-y-2 inline px-4 pb-4'>{parse(source.content.html.replace("/view/leks/doc/", "/search?dataset=leks&doc="))}</div>

    </div>
    }
  </>
  },
  leks_g: (source: any) => {
    return <>
    {source.content?.html && <div className='space-y-2'>{parse(source.content?.html)}</div>}
    </>
  },

  bsn:  (source: any) => {
    return <>
    <div className='space-y-2'>
    {source.rawData?.original?.stnavn?.komm ?
     <div><strong className="text-neutral-900">Merknad: </strong>{source.rawData.stnavn?.komm}</div>
     : source.rawData?.supplemented?.merknad && <div><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.supplemented?.merknad}</div>
    }
    </div>
    </>
  },
  hord: (source: any) => {
    const altLabels = getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])
    /*
    <InfoBox dataset={'hord'} items={[
      {title: 'Kommune', value: source.rawData.kommuneNamn}, 
      {title: 'Kommunenummer', value: source.rawData.kommuneNr}, 
      {title: "StedsnavnID", value: source.snid, href: `/view/hord?rawData.stadnamnID=${encodeURIComponent(source.snid)}`},
      {
        title: 'Gardsnummer', 
        items: [...new Set(source.cadastre?.map((item: any) => item.gnr.toString()) as string[])].map((gnr: string) => ({
          value: gnr, 
          href: `/view/hord?rawData.kommuneNr=${encodeURIComponent(source.rawData.kommuneNr)}&cadastre__gnr=${encodeURIComponent(gnr)}`
        })),
      },
      {
        title: 'Bruksnummer', 
        items: source.cadastre?.map((item: any) => ({
          value: item.bnr?.toString(), 
          href: `/view/hord?rawData.kommuneNr=${encodeURIComponent(source.rawData.kommuneNr)}&cadastre__gnr=${encodeURIComponent(item.gnr)}&cadastre__bnr=${encodeURIComponent(item.bnr)}`
        })),
      },
      
      {title: 'Oppskrivar', value: source.rawData.oppskrivar},
      {title: 'Oppskrivingstid', value: source.rawData.oppskrivingsTid},
    ]}/>
    */
    return <>
    <div className='space-y-2'>
    { altLabels && <div><strong className="text-neutral-900">Andre namneformer</strong><InfoPopover>Felta for fonemisk skrift (uttale) og namneformer var samanblanda i den opphavlege databasen. Vi har derfor slått dei saman under fellesnemninga «andre namneformer».</InfoPopover> {altLabels}</div>} 
    {source.rawData.merknader && <div><strong className="text-neutral-900">Merknader: </strong>{source.rawData.merknader}</div>}

    </div>
    {source.audio && <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/hord/${source.audio.file}`}></audio>}
    </>
  },
  nbas: null,
  nbas_reykjavik: (source: any) => {
    return <>
    <p lang="en">Legacy data from the Nordic Spatial Humanities project, and a preliminary transformation of the <Link href="/search?dataset=nbas">National Place Name Database</Link>.</p>
    </>
  },
  m1838: (source: any) => {
    return <>
    {source.misc?.merknad && <><strong className="text-neutral-900">Merknad: </strong>{source.misc?.merknad}</>}
    <div className="flex flex-wrap mt-3 gap-2">
    <Link href={source.link} className='rectangular-external-link'>Skannet matrikkel</Link>
    <Link href={source.misc.Lenke_til_digital_matrikkel} className='rectangular-external-link'>Digital matrikkel</Link>
    </div>

    </>

  },
  mu1950: (source: any) => <></>,
  m1886: (source: any) => {
    return <>
    {source.misc?.merknader && <><strong className="text-neutral-900">Merknad: </strong>{source.misc?.merknader}</>}

    {source.misc?.lenke_til_digital_matrikkel && <div className="flex flex-wrap mt-3 gap-4">
    <Link href={source.misc.lenke_til_digital_matrikkel} className='rectangular-external-link'>Digital matrikkel</Link>
    </div> }


    </>
  },    
  ostf: (source: any) => {
    /*
    <InfoBox dataset={'ostf'} 
                items={[
        {title: 'Oppslagsform', value: source.rawData['Oppslagsform/skriftform']},
        {title: 'Kommune', value: source.rawData["Herred for lokalitet"]},
        {title: 'Fylke', value: source.rawData.Fylke},
        {title: 'Matrikkelnummer', value: source.rawData.GNID},
        {title: 'Bind', value: source.rawData.Bind},
        {title: 'Sidetall', value: source.rawData["Sidetall/henvisning"]},
        {title: 'Koordinater', value: [source.rawData.X, source.rawData.Y].filter(Boolean).join(", ")},
        {title: 'Presisjon', value: source.rawData.Koordinattype},
        {title: 'StedsnavnID', value: source.rawData.SNID},
        {title: 'Unikt matrikkelnummer', items: source.gnidu?.map((gnidu: string) => ({value: gnidu, href: `/view/ostf?gnidu=${encodeURIComponent(gnidu)}`}))},
      ]}/>
    */
      return <>
      { source.links?.length &&
      <div>
      <h3>Lenker</h3>
      <ul className='!mt-0 !list-none !pl-0 !pt-0'>
        {source.links.map((link: any, index: number) => (
          <li key={index}><Link href={link} className=''>{link}</Link></li>
        ))}

      </ul>
      </div>
      }      
      </>
    },
    tot: (source: any) => {
      return <>
      {source.misc?.merknader && <><strong className="text-neutral-900">Merknad: </strong>{source.misc?.Kommentar}</>}
      </>
    },
    ssr2016: null,
    ssr2020: null,
    nrk: (source: any) => {
      return <>
      {(source.rawData.Uttale2 || source.rawData.Uttale1) && 
      <div>
      <h3 className='!m-0 !p-0'>Uttale</h3>
      {source.rawData.Uttale2 && <div>{parse(source.rawData.Uttale2)}</div>}
      {source.rawData.Uttale1 && <div>{parse(source.rawData.Uttale1)}</div>}
      {source.rawData.UttaleNy && <div>{parse(source.rawData.UttaleNy)} (Ny uttale)</div>}
      {source.rawData.Uttalemerknad && <div><strong>Uttalemerknad:</strong> {parse(source.rawData.Uttalemerknad)}</div>}
      </div>
      }


 
     </>
    },
    ft1900: null,
    ft1910: null,
    m2010: (source: any) => {
      return <>
      <div className='space-y-2'>
        <strong>Opphavleg oppslagsord:</strong><InfoPopover>Oppslagsorda i den opphavlege databasen var alle med store bokstavar og inneheldt romartal. Vi måtte derfor prøve å finne rett bruk av store og små bokstavar og fjerne romartala.</InfoPopover>
        {source.sosi == 'gard' ? source.misc.Gardsnamn : source.misc.Bruksnamn}
      </div>
      </>
    },
    frogn: (source: any) => {
      return <>
      {source.rawData.KOMMENTAR && <><strong className="text-neutral-900">Kommentar: </strong>{source.rawData.KOMMENTAR}</>}
      </>
    },
    gjerd: (source: any) => {
      return <>
      {source.rawData.KOMMENTAR && <><strong className="text-neutral-900">Kommentar: </strong>{source.rawData.KOMMENTAR}</>}
      </>
    },
    sorum: (source: any) => {
      return <>
      {source.rawData.KOMMENTAR && <><strong className="text-neutral-900">Kommentar: </strong>{source.rawData.KOMMENTAR}</>}
      </>
    }
    
  }