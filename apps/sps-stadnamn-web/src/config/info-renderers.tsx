import CadastralSubdivisions from '@/components/doc/cadastral-subdivisions';
import InfoBox from '@/components/ui/infobox';
import Link from 'next/link';
import React, { Fragment } from 'react';


import FacetsInfobox from '@/components/doc/facets-infobox';
import { getValueByPath } from '@/lib/utils';
import { treeSettings } from './server-config';
import SearchParamsLink from '@/components/ui/search-params-link';
import CollapsibleHeading from '@/components/doc/collapsible-heading';
import SearchLink from '@/components/ui/search-link';
import { PiMagnifyingGlass } from 'react-icons/pi';
import SourceList from '@/components/search/results/source-list';


const cadastreBreadcrumb = (source: Record<string, any>, docDataset: string, subunitName: string) => {
  const parentLabel = getValueByPath(source, treeSettings[docDataset]?.subunit) + " " + getValueByPath(source, subunitName )
  const parentUrl = `/view/${docDataset}/doc/${source.within}`
  const currentName = getValueByPath(source, treeSettings[docDataset]?.leaf) + " " + source.label
  return <div className="text-lg"><SearchParamsLink className="breadcrumb-link" href={parentUrl}>{parentLabel}</SearchParamsLink><span className="mx-2">/</span>{currentName}</div>
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
    <ul className='relative !mx-2 !px-0'>
      {timelineData.map((item, index) => {
        const [year, labels] = Object.entries(item)[0];
  
        return (
          <li key={index} className='flex items-center !pb-2 !pt-0 relative md:!pb-2'>

          <div className={`bg-primary-300 absolute w-1 left-0 top-0 ${index === timelineData.length -1 ? 'h-2' : 'h-full'} ${index === 0 && 'mt-2'}`}></div>
          <div className={`w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-1`}></div>
          
          

          <div className={`ml-6 ${''}`}>
            <strong className='mb-1'>{year}:&nbsp;</strong>
                {labels.map((label, i) => ( <span key={i}>
                  {labels.length > 1 && i > 0 ? ', ' : ''}<SearchParamsLink key={i} addParams={{"attestationYear": year, "attestationLabel": label}}>{label}</SearchParamsLink>
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


    return <>
    {uniqueLabels.size > 0 && <ul className='flex flex-wrap !list-none !p-0'>
    {Array.from(uniqueLabels).map((label: string, index: number) => {
      return <li key={index} className='whitespace-nowrap'>
        <SearchParamsLink addParams={{attestationLabel: label}}>
        {label}
        </SearchParamsLink>{index < uniqueLabels.size - 1 ? ',' : ''}&nbsp;</li>
    }
    )}
    </ul>}
    
    {source.attestations?.some((item: any) => item.label != source.label) && source.attestations?.length > 1 && 
      <>
        
        {Timeline(source.attestations)}
      </>}
      <CollapsibleHeading title="Kilder">
          <SourceList snid={source.snid} uuid={source.uuid} childList={source.children}/>
        </CollapsibleHeading>

      <CollapsibleHeading title="Detaljer">
        <FacetsInfobox dataset={'search'} source={source}/>
      </CollapsibleHeading>

    
    
    </>
  },
  sof: (source: any) => {
    return <>
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
    </>
  },
  rygh: (source: any) => {
    return <>
    { source.cadastre?.length > 0 &&
 <div className='flex flex-wrap gap-2'>
 
  <h3 className="font-semibold !text-base !m-0 !p-0 !font-sans">Matrikkel:</h3>
   {source.cadastre?.map((item: any, index: number) => {
    
    return <Fragment key={index}>
    
        <SearchLink className="no-underline flex items-center" dataset="rygh" params={{"rawData.KNR": source.rawData.KNR}}>{source.rawData.KNR} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></SearchLink>
      { item.gnr && <>- <SearchLink className="no-underline flex items-center" dataset="rygh" params={{"cadastre__gnr": item.gnr.toString(), "rawData.KNR": source.rawData.KNR}}>{item.gnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></SearchLink> </>}
      { item.bnr && <>{"/"} <SearchLink className="no-underline flex items-center" dataset="rygh" params={{"cadastre__gnr": item.gnr.toString(), "cadastre__bnr": item.bnr.toString(), "rawData.KNR": source.rawData.KNR}}>{item.bnr} <PiMagnifyingGlass className='inline ml-1 text-primary-600' /></SearchLink> </>}
      


  
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
    return <>
    {source.content?.html && <div className="inline-flex flex-col gap-4 bg-neutral-50 border border-neutral-200">
      <div className='border-b border-neutral-200 p-4'><Link href="https://urn.nb.no/URN:NBN:no-nb_digibok_2008121704022" className='whitespace-nowrap inline'>Norsk stadnamnleksikon 1997</Link></div>
    <HtmlString className='space-y-2 inline px-4 pb-4' htmlString={source.content.html} />

    </div>
    }
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
    <InfoBox dataset={'bsn'}
             items={[
                {title: 'Opppslagsform', value: source.label},
                {title: 'Preposisjon', value: source.rawData?.original?.stnavn?.oppslag?.prep},
                {title: 'Parform', value: source.rawData?.original?.stnavn?.parform_pf_navn},
                {title: 'Stedstype', value: source.rawData?.supplemented?.type, sosi: true},
                {title: 'Kommune', value: source.adm2},
                {title: 'Kommunenummer', value: source.rawData?.supplemented?.knr},
                {title: 'Fylke', value: source.adm1},
                {
                  title: 'Gardsnummer', 
                  items: [{value: source.rawData?.original?.stnavn?.sted?.gårdsnr, hrefParams: {
                    'adm2': source.adm2,
                    'adm1': source.adm1,
                    'rawData.stnavn.sted__gårdsnr': source.rawData?.original?.stnavn?.sted?.gårdsnr
                  }}]
                },
                {
                  title: 'Gardsnummer',
                  items: [{value: !source.rawData?.original?.stnavn?.sted?.gårdsnr && source.rawData?.supplemented?.gnr, hrefParams: {
                    'rawData.supplemented.knr': source.rawData?.supplemented?.knr,
                    'rawData.supplemented.gnr': source.rawData?.supplemented?.gnr,
                  }}]
                },
                {
                  title: 'Bruksnummer',
                  items: [{value: !source.rawData?.original && source.rawData?.original?.stnavn?.sted?.bruksnr, hrefParams: {
                    'rawData.adm2': source.adm2,
                    'rawData.adm1': source.adm1,
                    'rawData.stnavn.sted__bruksnr': source.rawData?.original?.stnavn?.sted?.bruksnr,
                    'rawData.stnavn.sted__gårdsnr': source.rawData?.original?.stnavn?.sted?.gårdsnr
                  }}]
                },
                {
                  title: 'Bruksnummer',
                  items: [{value: !source.rawData?.original && source.rawData?.supplemented?.bnr, hrefParams: {
                    'rawData.supplemented.knr': source.rawData?.supplemented?.knr,
                    'rawData.supplemented.bnr': source.rawData?.supplemented?.bnr,
                    'rawData.supplemented.gnr': source.rawData?.supplemented?.gnr
                  }}]
                },
                {title: 'StedsnavnID', value: source.rawData?.supplemented?.snid, href: `/view/search?snid=${encodeURIComponent(source.rawData?.supplemented?.snid)}`},
              ]}
    />
    </>
  },
  hord: (source: any) => {
    const altLabels = getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])
    return <>
    <div className='space-y-2'>
    { altLabels && <div><strong className="text-neutral-900">Andre navneformer (inkl. uttale): </strong>{altLabels}</div>}
    {source.rawData.merknader && <div><strong className="text-neutral-900">Merknader: </strong>{source.rawData.merknader}</div>}
    </div>
    {source.audio && <audio controls src={`https://iiif.test.ubbe.no/iiif/audio/hord/${source.audio.file}`}></audio>}
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
    { source.sosi == 'gard' &&
      <CadastralSubdivisions bnrField="rawData.LNR" sortFields={['cadastralIndex']} dataset={'m1838'} source={source} />
    }
    </div>
    <div>
    <h3>Detaljer</h3>
    <FacetsInfobox dataset={'m1838'} source={source}/>
    </div>
    </>

  },
  mu1950: (source: any) => {
    return <>
    <div>
    <h3>Eiendom</h3>
    { source.within && cadastreBreadcrumb(source, "mu1950", "rawData.Gardsnamn") }
    { source.sosi == 'gard' &&
      <CadastralSubdivisions bnrField="rawData.BNR" sortFields={['cadastre.bnr']} dataset={'mu1950'} source={source} />
    }
    </div>

    {source.sosi != 'gard' && 
      <div><h3>Detaljer</h3>
      <FacetsInfobox dataset={'mu1950'} source={source}/>
      </div>}

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
    { source.sosi == 'gard' &&
      <CadastralSubdivisions bnrField="rawData.bnr" sortFields={['cadastre.gnr', 'cadastre.bnr']} dataset={'m1886'} source={source} />
    }
    </div>
    <div>
      <CollapsibleHeading title="Detaljer">
      <FacetsInfobox dataset={'m1886'} source={source}/>
      </CollapsibleHeading>
    </div>

    </>
  },    
  ostf: (source: any) => {
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
      </>
    },
    ssr2016: (source: any) => {
      return <>
      <FacetsInfobox dataset={'ssr2016'} source={source}/>
      </>
    
    }
  
  }