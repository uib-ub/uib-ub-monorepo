import InfoBox from '@/components/ui/infobox';
import Link from 'next/link';

interface Renderer {
  title: (hit: any) => any;
  details: (hit: any) => any;
}

interface ResultRenderers {
  [key: string]: Renderer;
}

const getUniqueAltLabels = (source: any, prefLabel: string, altLabelKeys: string[]) => {
  const altLabels = altLabelKeys.map((key) => source[key]).filter((label: string) => label !== prefLabel && label);
  return [...new Set(altLabels)].join(', ')
}

const formatHighlight = (highlight: string) => {
  const segments = highlight.split(/<\/?em>/);
  return segments.map((segment, index) => index % 2 === 0 ? segment : <mark key={index}>{segment}</mark>);

}





export const resultRenderers: ResultRenderers = {
  bsn: {
    title: (hit: any) => {
      return <><strong>{hit._source.label}</strong> </>
    },
    details: (hit: any) => {
      // loktype is either an object or a list of objects. If it's a list, we want to join the types with a comma
      let loktypes = hit._source.rawData?.stnavn?.loktype
      if (Array.isArray(loktypes)) {
        loktypes = loktypes.map((type: any) => type.type).join(', ')
      }
      else {
        loktypes = loktypes?.type
      }
      return <>{loktypes}{loktypes && ', '}{hit._source.adm2}, {hit._source.adm1},  </>
    }
  },
  
  hord: {
    title: (hit: any) => {
      const source = hit._source
      const altLabels = getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])
      return <><strong>{source.label}{altLabels ? ', ':''}</strong>{altLabels}</> 
    },
    details: (hit: any) => {
      const source = hit._source
      const knr = source.rawData.kommuneNr
      const gnr = source.rawData.bruka?.bruk?.gardsNr
      const bnr = source.rawData.bruka?.bruk?.bruksNr
      const details = [gnr, bnr].filter((v) => v).join('/')
      const snippet = hit.highlight?.['rawData.merknader'][0] && formatHighlight(hit.highlight['rawData.merknader'][0])

      return  <>{snippet && <>{snippet} | </>}{ " " + source.rawData.kommuneNamn + ", " + knr}{details ? ' - ' + details : '' }</>
    },

  }
}


export const infoPageRenderers: Record<string, (source: any) => JSX.Element> = {
  bsn: (source: any) => {
    return <>
    <div className='space-y-2'>
    {source.rawData?.stnavn?.komm && <div><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.stnavn?.komm}</div>}
    </div>
    <InfoBox dataset={'bsn'}
             items={[
                {title: 'Opppslagsform', value: source.rawData?.stnavn?.oppslag?.oppslord},
                {title: 'Preposisjon', value: source.rawData?.stnavn?.oppslag?.prep},
                {title: 'Parform', value: source.rawData?.stnavn?.parform_pf_navn},
                {title: 'Stedstype', value: source.rawData?.stnavn?.sted?.type},
                {title: 'Kommune', value: source.adm2},
                {title: 'Fylke', value: source.adm1},
                {
                  title: 'Gardsnummer', 
                  items: [{value: source.rawData?.stnavn?.sted?.gårdsnr, href: `/view/bsn?rawData.stnavn.sted__gårdsnr=${encodeURIComponent(source.rawData?.stnavn?.sted?.gårdsnr)}`}]
                },
                {
                  title: 'Bruksnummer', 
                  items: [{value: source.rawData?.stnavn?.sted?.bruksnr, href: `/view/bsn?rawData.stnavn.sted__bruksnr=${encodeURIComponent(source.rawData?.stnavn?.sted?.bruksnr)}&rawData.stnavn.sted__gårdsnr=${encodeURIComponent(source.rawData?.stnavn?.sted?.gårdsnr)}`}]
                },
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
        items: [...new Set(source.cadastre?.map((item: any) => item.gnr) as string[])].map((gnr: string) => ({
          value: gnr, 
          href: `/view/hord?rawData.kommuneNr=${encodeURIComponent(source.rawData.kommuneNr)}&cadastre__gnr=${encodeURIComponent(gnr)}`
        })),
      },
      {
        title: 'Bruksnummer', 
        items: source.cadastre?.map((item: any) => ({
          value: item.bnr, 
          href: `/view/hord?rawData.kommuneNr=${encodeURIComponent(source.rawData.kommuneNr)}&cadastre__gnr=${encodeURIComponent(item.gnr)}&cadastre__bnr=${encodeURIComponent(item.bnr)}`
        })),
      },
      
      {title: 'Oppskrivar', value: source.rawData.oppskrivar},
      {title: 'Oppskrivingstid', value: source.rawData.oppskrivingsTid},
    ]}/>
    </>
  },
  ostf: (source: any) => {
      return <>
      { source.links?.length &&
      <div>
      <h3>Lenker</h3>
      <ul className='!mt-0'>
        {source.links.map((link: any, index: number) => (
          <li key={index}><Link href={link} className="">{link}</Link></li>
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
        {title: 'Sidetall', value: source.rawData["Sidetall/henvisning"]},
        {title: 'Koordinater', value: source.rawData.Y + ", " + source.rawData.X},
        {title: 'Presisjon', value: source.rawData.Koordinattype},
        {title: 'StedsnavnID', value: source.rawData.SNID},
        {title: 'Unikt matrikkelnummer', items: 
          ["GNIDu_01", "GNIDu_02", "GNIDu_03", "GNIDu_04", "GNIDu_05", "GNIDu_06"].filter(item => source.rawData[item]?.length).map(key => {
            return {value: source.rawData[key], href: `/view/ostf?rawData.${key}=${encodeURIComponent(source.rawData[key])}`}
          }

          )
        },
      ]}/>



      
      
      </>
  } 

}





export const defaultResultRenderer: Renderer = {
      title: (hit: any) => {
        return hit._source.label
      },
      details: (hit: any) => {
        return hit._source.adm2
      }
  }