interface Renderer {
  title: (hit: any) => any;
  details: (hit: any) => any;
}

interface ResultRenderers {
  [key: string]: Renderer;
}


const formatHighlight = (highlight: string) => {
  const segments = highlight.split(/<\/?em>/);
  return segments.map((segment, index) => index % 2 === 0 ? segment : <mark key={index}>{segment}</mark>);

}


const getUniqueAltLabels = (source: any, prefLabel: string, altLabelKeys: string[]) => {
  const altLabels = altLabelKeys.map((key) => source[key]).filter((label: string) => label !== prefLabel && label);
  return [...new Set(altLabels)].join(', ')
}

const defaultTitle = (hit: any) => {
  return <><strong>{hit._source.label}</strong> </>
}


export const resultRenderers: ResultRenderers = {
  rygh: {
    title: defaultTitle,
    details: (hit: any) => {
      return <>{hit._source.rawData.Lokalitetstype && hit._source.rawData.Lokalitetstype + " | "} {hit._source.adm2}{hit._source.adm1 && ', ' + hit._source.adm1}</>
    }
  },
  leks: {
    title: defaultTitle,
    details: (hit: any) => {
      return <>{hit._source.rawData.lokalitetstype && hit._source.rawData.lokalitetstype + " | "} {hit._source.adm2}{hit._source.adm1 && ', ' + hit._source.adm1}</>
    }
  },
  bsn: {
    title: defaultTitle,
    details: (hit: any) => {
      // loktype is either an object or a list of objects. If it's a list, we want to join the types with a comma
      let loktypes = hit._source.rawData?.original?.stnavn?.loktype
      if (Array.isArray(loktypes)) {
        loktypes = loktypes.map((type: any) => type.type).join(', ')
      }
      else {
        loktypes = loktypes?.type
      }
      return <>{loktypes}{loktypes && ' | '}{hit._source.adm2}, {hit._source.adm1}  </>
    }
  },
  ostf: {
    title: (hit: any) => {
      return <><strong>{hit._source.label}</strong> </>
    },
    details: (hit: any) => {
      // loktype is either an object or a list of objects. If it's a list, we want to join the types with a comma

      return <>{hit._source.adm2}, {hit._source.adm1}, {hit._source.rawData.GNID} </>
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


export const defaultResultRenderer: Renderer = {
  title: (hit: any) => {
    return hit._source.label
  },
  details: (hit: any) => {
    return hit._source.adm2
  }
}