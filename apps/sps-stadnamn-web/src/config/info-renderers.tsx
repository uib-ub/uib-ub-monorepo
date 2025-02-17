import Link from 'next/link';
import React, { Fragment } from 'react';
import parse from 'html-react-parser';


import FacetsInfobox from '@/components/doc/facets-infobox';
import CollapsibleHeading from '@/components/doc/collapsible-heading';
import { PiMagnifyingGlass } from 'react-icons/pi';
import Clickable from '@/components/ui/clickable/clickable';



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
    
      <Clickable link className="no-underline flex items-center" href="/search" only={{dataset, "rawData.KNR": source.rawData.KNR}}>{source.rawData.KNR} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></Clickable>
      { item.gnr && <>- <Clickable link className="no-underline flex items-center" only={{dataset, "cadastre__gnr": item.gnr.toString(), "rawData.KNR": source.rawData.KNR}}>{item.gnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></Clickable> </>}
      { item.bnr && <>{"/"} <Clickable link className="no-underline flex items-center" only={{dataset, "cadastre__gnr": item.gnr.toString(), "cadastre__bnr": item.bnr.toString(), "rawData.KNR": source.rawData.KNR}}>{item.bnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></Clickable> </>}
      


  
   </Fragment>
   })}
   </div>   
    }

    {source.content?.html && <div className="inline-flex flex-col inner-slate">
     <div className='border-b border-neutral-200 p-4'><Link href={source.rawData.Lenke_til_originalside} className='whitespace-nowrap inline'>Bind {source.rawData.Bind}, s. {source.rawData.Side}</Link></div>
    <div className='space-y-2 inline p-4'>{parse(source.content.html)}</div>

    </div>
    }

    </>
  },
  leks_etymology: (html: string) => { // Replace when the new encyclopedia is ready
    return <div className='space-y-2 inline p-4'>{parse(html.replace("/view/leks/doc/", "/search?dataset=leks&doc="))}</div>
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
    { altLabels && <div><strong className="text-neutral-900">Andre navneformer (inkl. uttale): </strong>{altLabels}</div>}
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
    {source.rawData?.merknad && <><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.merknad}</>}
    <div className="flex flex-wrap mt-3 gap-2">
    <Link href={source.rawData.Lenke_til_skannet_matrikkel} className='rectangular-external-link'>Skannet matrikkel</Link>
    <Link href={source.rawData.Lenke_til_digital_matrikkel} className='rectangular-external-link'>Digital matrikkel</Link>
    </div>

    </>

  },
  mu1950: (source: any) => <></>,
  m1886: (source: any) => {
    return <>
    {source.rawData?.merknader && <><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.merknader}</>}

    {source.rawData?.lenke_til_digital_matrikkel && <div className="flex flex-wrap mt-3 gap-4">
    <Link href={source.rawData.lenke_til_digital_matrikkel} className='rectangular-external-link'>Digital matrikkel</Link>
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
    ssr2016: null
  
  }