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




export const resultRenderers: ResultRenderers = {
  hord: {
    title: (source: any) => {
      const altLabels = getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])
      return <><strong>{source.label}</strong>{altLabels ? ', ' + altLabels : ''}</> 
    },
    details: (source: any) => {
      const knr = source.rawData.kommuneNr
      const gnr = source.rawData.bruka?.bruk?.gardsNr
      const bnr = source.rawData.bruka?.bruk?.bruksNr
      const details = knr ? knr + " - " + [gnr, bnr].filter((v) => v).join('/') : [gnr, bnr].filter((v) => v).join('/');
      const reference = source.archive.institution
      return  <>{ source.adm2 + ' kommune'}{details ? ', ' + details : '' }{ reference ? '. ' + reference : ''}</>
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
      {title: 'Gardsnummer', value: source.rawData.bruka?.bruk?.gardsNr, searchFields: {'rawData.kommuneNr': source.rawData.kommuneNr, 'rawData.bruka__bruk.gardsNr': source.rawData.bruka?.bruk?.gardsNr}},
      {title: 'Oppskrivar', value: source.rawData.oppskrivar},
      {title: 'Oppskrivingstid', value: source.rawData.oppskrivingsTid},
    ]}/>
    </>
  }
}


export const defaultResultRenderer: Renderer = {
      title: (source: any) => {
        return source.label
      },
      details: (source: any) => {
        return source.adm2
      }
  }