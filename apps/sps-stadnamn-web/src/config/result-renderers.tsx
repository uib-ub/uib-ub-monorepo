interface Renderer {
  title: (hit: any) => any;
  details: (hit: any) => any;
  snippet?: (hit: any) => any;
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

const loktypeDetails = (loktype: string, hit: any) => {
  return <>{loktype}{loktype && ' – '} {hit._source.adm2}{hit._source.adm1 && ', ' + hit._source.adm1}  </>
}




export const resultRenderers: ResultRenderers = {
  search: {
    title: defaultTitle,
    details: (hit: any) => {
      return <>{hit._source.adm2 && hit._source.adm2 + ", "}{hit._source.adm1}{ hit._source.adm1 == "[Uordna]" && <>&nbsp;<em>{hit._source.adm2Fallback && hit._source.adm2Fallback + ", " }{hit._source.adm1Fallback}</em></> }</>
    }
  },
  sof: {
    title: (hit: any) => {
    return <>{defaultTitle(hit)} | {hit._source.rawData?.KommuneNr}{hit._source.rawData?.GardsNr && '-'}{hit._source.rawData?.GardsNr}{hit._source.rawData?.GardsNr && '/'}{hit._source.rawData?.GardsNr}</>
    },
    details: (hit: any) => {
      return <>{hit._source.adm2}{hit._source.adm1 && ', ' + hit._source.adm1}</>
    }
  },
  rygh: {
    title: (hit: any) => {
      return <>{defaultTitle(hit)} {hit._source.cadastre && <> | {hit._source.rawData.KNR}-{hit._source.cadastre[0]?.gnr}{hit._source.cadastre[0]?.bnr && '/'}{hit._source.cadastre[0]?.bnr}</> }</>
    },
    details: (hit: any) => {
      return loktypeDetails(hit._source.rawData.Lokalitetstype, hit)
    }
  },
  leks: {
    title: defaultTitle,
    details: (hit: any) => {
      return loktypeDetails(hit._source.rawData.lokalitetstype, hit)
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
      return loktypeDetails(loktypes, hit)
    }
  },
  hord: {
    title: (hit: any) => {
      const source = hit._source
      const altLabels = getUniqueAltLabels(source.rawData, source.label, ['namn', 'oppslagsForm', 'normertForm', 'uttale'])
      return <><strong>{source.label}{altLabels ? ', ':''}</strong>{altLabels}</> 
    },
    snippet: (hit: any) => {
      return hit.highlight?.['rawData.merknader'][0] && formatHighlight(hit.highlight['rawData.merknader'][0])
    },
    details: (hit: any) => {
      const source = hit._source
      const knr = source.rawData.kommuneNr
      const gnr = source.rawData.bruka?.bruk?.gardsNr
      const bnr = source.rawData.bruka?.bruk?.bruksNr
      const details = [gnr, bnr].filter((v) => v).join('/')

      return  <>{ " " + source.rawData.kommuneNamn + ", " + knr}{details ? ' - ' + details : '' }</>
    }
  },
  nbas: {
    title: defaultTitle,
    details: (hit: any) => {
      return loktypeDetails(hit._source.rawData?.lokalitetstype_sosiype, hit)
    }
  },
  m1838: {
    title: (hit: any) => {
      return <>{defaultTitle(hit)} | {hit._source.rawData?.KNR}-{hit._source.rawData?.MNR}{hit._source.rawData?.LNR && '.'}{hit._source.rawData?.LNR}</>
    },
    details: (hit: any) => {
      return loktypeDetails(hit._source.rawData?.Lokalitetstype, hit)
    }
  },
  m1886: {
    title: (hit: any) => {
      return <>{defaultTitle(hit)} | {hit._source.rawData?.knr}-{hit._source.rawData?.gnr}{hit._source.rawData?.bnr && '/'}{hit._source.rawData?.bnr}</>
    },
    details: (hit: any) => {
      return loktypeDetails(hit._source.sosi && (hit._source.sosi[0].toUpperCase() + hit._source.sosi.slice(1)), hit)
    }
  },
  mu1950: {
    title: (hit: any) => {
      return <>{defaultTitle(hit)} | {hit._source.rawData?.knr}-{hit._source.rawData?.gnr}{hit._source.rawData?.bnr && '/'}{hit._source.rawData?.bnr}</>
    },
    details: (hit: any) => {
      return loktypeDetails(hit._source.sosi && (hit._source.sosi[0].toUpperCase() + hit._source.sosi.slice(1)), hit)
    }
  },
  skul: {
    title: (hit: any) => {
      return <>{defaultTitle(hit)} | {hit._source.rawData?.knr}-{hit._source.rawData?.gnr}{hit._source.rawData?.bnr && '/'}{hit._source.rawData?.bnr}</>
    },
    details: (hit: any) => {
      return loktypeDetails(hit._source.type && (hit._source.type[0].toUpperCase() + hit._source.sosi.slice(1)), hit)
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
  
  
}


export const defaultResultRenderer: Renderer = {
  title: defaultTitle,
  details: (hit: any) => {
    return <>{hit._source.adm2}{hit._source.adm1 && ', ' + hit._source.adm1}</>
  }
}