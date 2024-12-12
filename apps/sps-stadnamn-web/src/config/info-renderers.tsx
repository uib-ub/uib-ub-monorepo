import Link from 'next/link';
import React, { Fragment } from 'react';


import FacetsInfobox from '@/components/doc/facets-infobox';
import { getValueByPath } from '@/lib/utils';
import { treeSettings } from './server-config';
import CollapsibleHeading from '@/components/doc/collapsible-heading';
import { PiMagnifyingGlass } from 'react-icons/pi';
import SourceList from '@/components/search/results/source-list';
import SearchLink from '@/components/ui/search-link';

const cadastreBreadcrumb = (source: Record<string, any>, docDataset: string, subunitName: string) => {
  const parentLabel = getValueByPath(source, treeSettings[docDataset]?.subunit) + " " + getValueByPath(source, subunitName )
  const currentName = getValueByPath(source, treeSettings[docDataset]?.leaf) + " " + source.label
  return <div className="text-lg"><SearchLink className="breadcrumb-link" add={{doc: source.within}}>{parentLabel}</SearchLink><span className="mx-2">/</span>{currentName}</div>
}


const getUniqueAltLabels = (source: any, prefLabel: string, altLabelKeys: string[]) => {
    const altLabels = altLabelKeys.map((key) => source[key]).filter((label: string) => label !== prefLabel && label);
    return [...new Set(altLabels)].join(', ')
  }



  function createMarkup(htmlString: string) {
    const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return {__html: decodedHtmlString};
  }
  
  function HtmlString({htmlString, className}: {htmlString: string, className?: string}) {
    return <div className={className} dangerouslySetInnerHTML={createMarkup(htmlString)} />;
  }

  const Timeline = (arr: { label: string; year: string }[]) => {
    const grouped: Record<string,string[]> = {};

    arr?.forEach(item => {
        if (grouped[item.year]) {
            grouped[item.year].push(item.label);
        } else {
            grouped[item.year] = [item.label];
        }
    });

    const timelineData: Record<string, string[]>[] = Object.keys(grouped).map(year => {
        return { [year]: grouped[year] };
      });


  return (
    <ul className='relative !mx-2 !px-0 p-2'>
      {timelineData.map((item, index) => {
        const [year, labels] = Object.entries(item)[0];
  
        return (
          <li key={index} className='flex items-center !pb-2 !pt-0 relative md:!pb-2'>

          <div className={`bg-primary-300 absolute w-1 left-0 top-0 ${index === timelineData.length -1 ? 'h-2' : 'h-full'} ${index === 0 && 'mt-2'}`}></div>
          <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-1`}></div>
          
          

          <div className={`ml-6 gap-2 flex`}>
            <strong className='bg-primary-100 rounded-full px-2'>{year}</strong>
                {labels.map((label, i) => ( <span key={i}>
                  <SearchLink className="no-underline bg-neutral-100 text-neutral-950 rounded-full px-2" key={i} add={{"attestationYear": year, "attestationLabel": label}}>{label}</SearchLink>
                  </span>
                ))}
          </div>
        </li>
        );
      }
      )}
    </ul>
  );
}



export const infoPageRenderers: Record<string, (source: any) => JSX.Element> = {
  search: (source: any) => {
    //const uniqueLabels = getUniqueAltLabels(source, source.label, ['altLabels', 'attestations.label'])
    const uniqueLabels = new Set<string>(source.altLabels?.filter((label: string) => label !== source.label))
    source.attestations?.forEach((item: any) => {
      if (item.label !== source.label) {
        uniqueLabels.add(item.label)
      }
    })

    const hasAltLabels = uniqueLabels.size > 0
    const hasAttestations = source.attestations?.some((item: any) => item.label != source.label) && source.attestations?.length > 1


    return <>
    { hasAltLabels && hasAttestations &&
    <div className="border-2 p-2 inner-slate">
    {hasAltLabels && <ul className='flex flex-wrap !list-none !p-0 gap-1'>
    {Array.from(uniqueLabels).map((label: string, index: number) => {
      return <li key={index} className='whitespace-nowrap'>
        <SearchLink add={{attestationLabel: label}} className="no-underline bg-white border border-neutral-200 shadow-sm rounded-full text-neutral-950 rounded-full px-2">
        {label}
        </SearchLink></li>
    }
    )}
    </ul>}
    
    {hasAttestations && 
      <>
        
        {Timeline(source.attestations)}
      </>}
      </div>
      }
      {false && <CollapsibleHeading title="Kilder" quantity={source.children.length}>
          <SourceList snid={source.snid} uuid={source.uuid} childList={source.children}/>
        </CollapsibleHeading>}

      <CollapsibleHeading title="Detaljer">
        <FacetsInfobox dataset={'search'} source={source}/>
      </CollapsibleHeading>

    
    
    </>
  },
  sof: (source: any) => {
    /*
    <InfoBox dataset={'sof'} items={[
      {title: 'Normert form', value: source.rawData.Normform},
      {title: 'Oppslagsform', value: source.rawData.OppsForm},
      {title: 'Lydskrift', value: source.rawData.Fonskr},
      {title: 'Kulturkode', value: source.rawData.Kulturkode},
      {title: 'Kommunenummer', value: source.rawData.KommuneNr},
      {title: 'Kommune', value: source.adm2},
      {title: 'Fylke', value: source.adm1},
      {title: 'Gardsnummer', value: source.rawData.Gardsnr},
      {title: 'Bruksnummer', value: source.rawData.Bruksnr},
      {title: 'Oppskriver', value: source.rawData.Oppskrivar},
      {title: 'Informant', value: source.rawData.Informant}
    ]}/>

    */
    return <>
    <FacetsInfobox dataset={'sof'} source={source}/>
    
    </>
  },
  rygh: (source: any) => {
    return <>
    { source.cadastre?.length > 0 &&
 <div className='flex flex-wrap gap-2'>
 
  <h3 className="font-semibold !text-base !m-0 !p-0 !font-sans">Matrikkel:</h3>
   {source.cadastre?.map((item: any, index: number) => {
    const dataset = "rygh"
    return <Fragment key={index}>
    
      <SearchLink className="no-underline flex items-center" href="/search" only={{dataset, "rawData.KNR": source.rawData.KNR}}>{source.rawData.KNR} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></SearchLink>
      { item.gnr && <>- <SearchLink className="no-underline flex items-center" only={{dataset, "cadastre__gnr": item.gnr.toString(), "rawData.KNR": source.rawData.KNR}}>{item.gnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></SearchLink> </>}
      { item.bnr && <>{"/"} <SearchLink className="no-underline flex items-center" only={{dataset, "cadastre__gnr": item.gnr.toString(), "cadastre__bnr": item.bnr.toString(), "rawData.KNR": source.rawData.KNR}}>{item.bnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></SearchLink> </>}
      


  
   </Fragment>
   })}
   </div>   
    }

    {source.content?.html && <div className="inline-flex flex-col bg-neutral-50 border border-neutral-200">
     <div className='border-b border-neutral-200 p-4'><Link href={source.rawData.Lenke_til_originalside} className='whitespace-nowrap inline'>Bind {source.rawData.Bind}, s. {source.rawData.Side}</Link></div>
    <HtmlString className='space-y-2 inline p-4' htmlString={source.content.html} />

    </div>
    }
    <CollapsibleHeading title="Detaljer">
      <FacetsInfobox dataset={'rygh'} source={source}/>
    </CollapsibleHeading>

    </>
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
    {source.content?.html && <div className="inline-flex flex-col gap-4 bg-neutral-50 border border-neutral-200">
      <div className='border-b border-neutral-200 p-4'><Link href="https://urn.nb.no/URN:NBN:no-nb_digibok_2008121704022" className='whitespace-nowrap inline'>Norsk stadnamnleksikon 1997</Link></div>
    <HtmlString className='space-y-2 inline px-4 pb-4' htmlString={source.content.html} />

    </div>
    }
    <CollapsibleHeading title="Detaljer">
    <FacetsInfobox dataset={'leks'} source={source}/>
    </CollapsibleHeading>
  </>
  },
  leks_g: (source: any) => {
    return <>
    {source.content?.html && <HtmlString className='space-y-2' htmlString={source.content?.html} />}
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
    <CollapsibleHeading title="Detaljer">
    <FacetsInfobox dataset={'bsn'} source={source} />
    </CollapsibleHeading>
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
    <CollapsibleHeading title="Detaljer">
    <FacetsInfobox dataset={'hord'} source={source}/>
    </CollapsibleHeading>
    </>
  },
  nbas: (source: any) => {
    return <>
    <FacetsInfobox dataset={'nbas'} source={source}/>
    </>
  },  
  m1838: (source: any) => {
    return <>
    {source.rawData?.merknad && <><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.merknad}</>}
    <div className="flex flex-wrap mt-3 gap-4">
    <Link href={source.rawData.Lenke_til_skannet_matrikkel} className='font-semibold no-underline bg-neutral-100 p-2 px-4 external-link'>Skannet matrikkel</Link>
    <Link href={source.rawData.Lenke_til_digital_matrikkel} className='font-semibold no-underline bg-neutral-100 p-2 px-4 external-link'>Digital matrikkel</Link>
    </div>
    <div>
    <h3>Eiendom</h3>
    { source.within && cadastreBreadcrumb(source, "m1838", "misc.gardLabel") }
    </div>
    <CollapsibleHeading title="Detaljer">
    <FacetsInfobox dataset={'m1838'} source={source}/>
    </CollapsibleHeading>

    </>

  },
  mu1950: (source: any) => {
    return <>
    {source.sosi != 'gard' &&
      <>
      { source.within && cadastreBreadcrumb(source, "mu1950", "rawData.Gardsnamn") }
      <CollapsibleHeading title="Detaljer">
      <FacetsInfobox dataset={'mu1950'} source={source}/>
      </CollapsibleHeading>
      </>
    }


    </>
  },
  m1886: (source: any) => {
    return <>
    {source.rawData?.merknader && <><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.merknader}</>}

    {source.rawData?.lenke_til_digital_matrikkel && <div className="flex flex-wrap mt-3 gap-4">
    <Link href={source.rawData.lenke_til_digital_matrikkel} className='font-semibold no-underline bg-neutral-100 p-2 px-4 external-link'>Digital matrikkel</Link>
    </div> }
    <div>
    <h3>Eiendom</h3>
    { source.within && cadastreBreadcrumb(source, "m1886", "rawData.gardsnamn") }
    </div>
    <div>
      <CollapsibleHeading title="Detaljer">
      <FacetsInfobox dataset={'m1886'} source={source}/>
      </CollapsibleHeading>
    </div>

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
      <ul className='!mt-0 !list-none !pl-0'>
        {source.links.map((link: any, index: number) => (
          <li key={index}><Link href={link} className=''>{link}</Link></li>
        ))}

      </ul>
      </div>
      }
      <CollapsibleHeading title="Detaljer">
      <FacetsInfobox dataset={'ostf'} source={source}/>
      </CollapsibleHeading>
      
      </>
    },
    ssr2016: (source: any) => {
      return <>
      <FacetsInfobox dataset={'ssr2016'} source={source}/>
      </>
    
    }
  
  }