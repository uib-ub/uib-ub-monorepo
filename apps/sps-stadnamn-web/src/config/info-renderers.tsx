import InfoBox from '@/components/ui/infobox';
import Link from 'next/link';
import React from 'react';



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

  const Timeline = (arr: { label: string; year: string }[], noCoordinates: boolean) => {
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
                  {labels.length > 1 && i > 0 ? ', ' : ''}<span className=' list-none !py-0' key={i}>{label}</span>
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
    return <>
    {source.attestations && Object.keys(source.attestations).length > 1 && <div>
    <h3>Historikk</h3>
    {Timeline(source.attestations, !source.location)}
    </div>
    }
    
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

    {source.content?.html && <div className="inline-flex flex-col md:flex-row gap-4">
      <Link href={source.rawData.Lenke_til_originalside} className='whitespace-nowrap inline'>Bind {source.rawData.Bind}, side {source.rawData.Side}</Link>
    <HtmlString className='space-y-4 inline' htmlString={source.content.html} />

    </div>
    
    }
    <InfoBox dataset={'rygh'} items={[
      {title: 'Stadnamn', value: source.label},
      {title: 'Lokalitetstype', value: source.sosi, sosi: true},
      {title: 'Herred', value: source.adm2},
      {title: 'Amt', value: source.adm1},
      {title: 'Kommunenummer', value: source.rawData.KNR},
      {
        title: 'Gardsnummer', 
        items: [...new Set(source.cadastre?.map((item: {gnr: number, bnr?: number}) => item.gnr.toString()) as string[])].map((gnr: string) => ({
          value: gnr, 
          href: `/view/rygh?rawData.KNR=${encodeURIComponent(source.rawData.KNR)}&cadastre__gnr=${encodeURIComponent(gnr)}`
        })),
      },
      {
        title: 'Bruksnummer', 
        items: source.cadastre?.map((item: {gnr: number, bnr: number}) => ({
          value: item.bnr?.toString(), 
          href: `/view/rygh?rawData.KNR=${encodeURIComponent(source.rawData.KNR)}&cadastre__gnr=${encodeURIComponent(item.gnr.toString())}&cadastre__bnr=${encodeURIComponent(item.bnr?.toString())}`
        })),
      },
    
    ]}/>
    </>
  },
  leks: (source: any) => {
    return <>
    <div className='space-y-2'>
    {source.rawData?.tolking && <><strong className="text-neutral-900">Tolking: </strong><HtmlString htmlString={source.rawData?.tolking} /></>}
    </div>
    <InfoBox dataset={'leks'} items={[
      {title: 'Oppslagsform', value: source.label},
      {title: 'Lokalitetstype', value: source.rawData.lokalitetstype},
      {title: 'Kommune', value: source.adm2},
      {title: 'Kommunenummer', value: source.rawData.kommunenr},
      {title: 'Fylke', value: source.adm1},
      {title: 'Førsteledd', value: source.rawData.førsteledd},
      {title: 'Sisteledd', value: source.rawData.sisteledd},
      {title: 'StedsnavnID', 
        items: [{value: source.rawData.snid, href: `/view/leks?rawData.snid=${encodeURIComponent(source.rawData.snid)}`}]},
      {title: 'GNIDu', 
        items: [{value: source.rawData.gnidu, href: `/view/leks?rawData.gnidu=${encodeURIComponent(source.rawData.gnidu)}`}]},
      {title: 'N50 Kartid', value: source.rawData.n50_kartid}
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
          value: item.bnr.toString(), 
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
    <InfoBox dataset={'nbas'} 
              items={[
      {title: 'Stadnamn', value: source.rawData.oppslagsform},
      {title: 'Lokalitetstype', value: source.rawData.lokalitetstype_sosi, sosi: true},
      {title: 'Kommune', value: source.rawData.herred},
      {title: 'Fylke', value: source.rawData.fylke},
      {title: 'Kommunenummer', value: source.rawData.kommunenummer},
      {title: 'GNIDu', value: source.rawData.gnidu},
    ]}/>
    </>
  },  
  m1838: (source: any) => {
    return <>
    {source.rawData?.merknad && <><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.merknad}</>}
    <InfoBox dataset={'m1838'} 
    items={[
      {title: 'Lokalitetstype', value: source.sosi, sosi: true},
      {title: 'Prestegjeld', value: source.adm2},
      {title: 'Amt', value: source.adm1},
      {title: 'Kommunenummer', value: source.rawData.KNR},
      {title: 'Matrikkelnummer', items: [{value: source.rawData.MNR, hrefParams: {'rawData.MNR': source.rawData.MNR, 'rawData.KNR': source.rawData.KNR }}]},
      {title: 'Løpenummer', value: source.rawData.LNR},
      {title: 'GNIDu', value: source.rawData.GNIDu},
      {title: 'StedsnavnID', value: source.rawData.SNID}


    ]}/>


    </>
  },
  mu1950: (source: any) => {
    return <>
    <InfoBox dataset={'mu1950'} 
              items={[
      {title: 'Stadnamn', value: source.label},
      {title: 'Kommune', value: source.adm2},
      {title: 'Fylke', value: source.adm1},
      {title: 'Kommunenummer', value: source.rawData?.knr},
      {title: 'Gardsnummer', value: source.rawData?.gnr},
      {title: 'Bruksnummer', value: source.rawData?.bnr},
      {title: 'GNIDu', value: source.rawData?.gnidu},
    ]}/>

    </>
  },
  m1886: (source: any) => {
    return <>
    {source.rawData?.merknader && <><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.merknader}</>}
    
    <div className="mt-3">
    <Link href={source.rawData.lenke_til_digital_matrikkel} className='font-semibold'>Lenke til digital matrikkel</Link>
    </div>
    
    <InfoBox dataset={'m1886'}
             items={[
              {title: 'Stadnamn', value: source.label},
              {title: 'Kommune', value: source.adm2},
              {title: 'Fylke', value: source.adm1},
              {title: 'Lokalitetstype', value: source.sosi, sosi: true},
              {title: 'Kommunenummer', value: source.rawData.knr},
              {title: 'Gardsnummer', value: source.cadastre.gnr},
              {title: 'Bruksnummer', value: source.cadastre.bnr},
              {title: 'GNIDu', value: source.rawData.gnidu}
    ]}/>

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
        {title: 'Unikt matrikkelnummer', items: source.gnidu.map((gnidu: string) => ({value: gnidu, href: `/view/ostf?gnidu=${encodeURIComponent(gnidu)}`}))},
      ]}/>
      </>
    } 
  
  }