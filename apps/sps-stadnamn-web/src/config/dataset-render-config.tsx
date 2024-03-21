import InfoBox from '@/components/ui/infobox';

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
  hord: {
    title: (hit: any) => {
      const source = hit._source
      const altLabels = getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])
      return <><strong>{source.label}</strong>{altLabels ? ', ' + altLabels : ''}</> 
    },
    details: (hit: any) => {
      const source = hit._source
      const knr = source.rawData.kommuneNr
      const gnr = source.rawData.bruka?.bruk?.gardsNr
      const bnr = source.rawData.bruka?.bruk?.bruksNr
      const details = [gnr, bnr].filter((v) => v).join('/')
      const snippet = hit.highlight?.['rawData.merknader'][0] && formatHighlight(hit.highlight['rawData.merknader'][0])

      return  <>{snippet && <>{snippet} | </>}{ source.rawData.kommuneNamn + ", " + knr}{details ? ' - ' + details : '' }</>
    },

  }
}


export const infoPageRenderers: Record<string, (source: any) => JSX.Element> = {
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
      {title: 'Gardsnummer', value: source.cadastre?.map((item: any) => item.gnr), searchFields: {'rawData.kommuneNr': source.rawData.kommuneNr, 'cadastre__gnr': source.rawData.bruka?.bruk?.gardsNr}},
      {title: 'Bruksnummer', value: source.cadastre?.map((item: any) => item.bnr), searchFields: {'rawData.kommuneNr': source.rawData.kommuneNr, 'cadastre__gnr': source.rawData.bruka?.bruk?.gardsNr, 'cadastre__bnr': source.rawData.bruka?.bruk?.bruksNr}},
      {title: 'Oppskrivar', value: source.rawData.oppskrivar},
      {title: 'Oppskrivingstid', value: source.rawData.oppskrivingsTid},
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