import { getFieldValue } from "@/lib/utils";

interface Renderer {
  fields?: string[];
  title?: (hit: any, display: string) => any;
  details?: (hit: any, display: string) => any;
  cadastre?: (hit: any) => any;
  snippet?: (hit: any) => any;
  sourceTitle?: (hit: any) => any;
  sourceDetails?: (hit: any) => any;
}

interface DefaultRenderer {
  title: (hit: any, display: string) => any;
  details: (hit: any, display: string) => any;
  cadastre?: (hit: any) => any;
  snippet: (hit: any) => any;
  sourceTitle: (hit: any) => any;
  sourceDetails: (hit: any) => any;
}

interface ResultRenderers {
  [key: string]: Renderer;
}


function createMarkup(htmlString: string) {
  const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  return {__html: decodedHtmlString};
}

const formatHighlight = (highlight: string) => {
  // Remove inomplete html tags
  const processedHighlight = highlight.replace(/<[^>]*$/, '').replace(/^[^<]*>/, '')

  return <div dangerouslySetInnerHTML={createMarkup(processedHighlight)}></div>;
}

const defaultTitle = (hit: any) => {
  return <strong className="font-semibold">{multivalue(getFieldValue(hit, 'label'))}</strong>
}

const loktypeDetails = (loktype: string, hit: any) => {
  return <>{loktype}{loktype && ' – '} {getFieldValue(hit, 'adm2')}{getFieldValue(hit, 'adm1') && ', ' + getFieldValue(hit, 'adm1')}  </>
}



const multivalue = (value: string|string[]) => {
  return Array.isArray(value) ? value.join("/") : value
}

export function formatCadastre(cadastre: Record<string, any>[]): string {
  return cadastre.map(item => {
      if (Array.isArray(item.gnr) && item.gnr.length > 1) {

              return item.gnr.join(",")

      } else if (item.bnr) {
          if (Array.isArray(item.bnr)) {
              // Sort bnr to ensure correct range identification
              const sortedBnr = item.bnr.sort((a, b) => a - b);
              const ranges = [];
              let start = sortedBnr[0];
              let end = start;

              for (let i = 1; i < sortedBnr.length; i++) {
                  if (sortedBnr[i] === end + 1) {
                      end = sortedBnr[i];
                  } else {
                      if (start === end) {
                          ranges.push(`${item.gnr}/${start}`);
                      } else {
                          ranges.push(`${item.gnr}/${start}-${end}`);
                      }
                      start = sortedBnr[i];
                      end = start;
                  }
              }

              // Handle the last range or number
              if (start === end) {
                  ranges.push(`${item.gnr}/${start}`);
              } else {
                  ranges.push(`${item.gnr}/${start}-${end}`);
              }

              return ranges.join(', ');
          } else {
              return `${item.gnr}/${item.bnr}`;
          }
      } else {
          return `${item.gnr}`;
      }
  }).join(', ');
}


const formatAdm = (hit: any) => {
  const adm1 = getFieldValue(hit, 'adm1')
  const adm2 = getFieldValue(hit, 'adm2')
  const adm3 = getFieldValue(hit, 'adm3')
  return <>{adm3}{adm3 && ' – '}{multivalue(adm1)?.length > 0 && adm2 !== adm1 && adm2 + ', '}{adm1}</>
}

const cadastreAdm = (knr: string | undefined, gnr: string | undefined, bnr: string | undefined, sep: string, hit: any, display: string ) => {
  const cadastre = getFieldValue(hit, 'cadastre')

  const admText = display != 'grouped' ? <>{(cadastre || gnr) && gnr != "0" && ', '}{formatAdm(hit)}</> : ''
  if (cadastre) {
    return <>{!knr && "Gnr" + (cadastre.bnr ? "/Bnr": "") + ": "}{knr}{knr && "-"}{formatCadastre(cadastre)}{admText}</>
  }
  if (!gnr || gnr == '0') {
    return admText
  }
  return  <>{!knr && "Gnr" + (bnr ? "/Bnr": "") + ": "}{gnr && knr}{knr && gnr && '-'}{gnr}{bnr && bnr != '0' ? sep + bnr : ''}{admText}</>
}


export const resultRenderers: ResultRenderers = {
  search: {
    title: defaultTitle,
    details: (hit: any, display: string) => {
      return <>{getFieldValue(hit, 'adm2') && multivalue(getFieldValue(hit, 'adm2')) + ", "}{multivalue(getFieldValue(hit, 'adm1'))}{ getFieldValue(hit, 'adm1') == "[Uordna]" && <>&nbsp;<em>{getFieldValue(hit, 'adm2Fallback') && getFieldValue(hit, 'adm2Fallback') + ", " }{getFieldValue(hit, 'adm1Fallback')}</em></> }</>
    }
  },
  sof: {
    title: (hit: any, display: string) => {
     const placeType = multivalue(getFieldValue(hit, 'placeType.label'))
     if (placeType) {
        return <>{defaultTitle(hit)} {` (${placeType.toLowerCase()})`}</>
      }
      else {
        return defaultTitle(hit)
      }
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(getFieldValue(hit, 'rawData.KommuneNr'), getFieldValue(hit, 'rawData.GardsNr'), getFieldValue(hit, 'rawData.BruksNr'), "/", hit, display)
    }
  },
  rygh: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
      return <>{defaultTitle(hit)}{getFieldValue(hit, 'sosi') && ` (${getFieldValue(hit, 'sosi').toLowerCase()})`}</>
    },
    snippet: (hit: any) => {
      return hit.highlight?.['content.html'][0] && formatHighlight(hit.highlight['content.html'][0])
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(getFieldValue(hit, 'rawData.KNR'), getFieldValue(hit, 'rawData.Gnr'), getFieldValue(hit, 'rawData.Bnr'), "/", hit, display)
    }
  },
  leks: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
      return <>{defaultTitle(hit)}{getFieldValue(hit, 'rawData.Lokalitetstype') ? ` (${getFieldValue(hit, 'rawData.Lokalitetstype').toLowerCase()})` : ""}</>
    },
    snippet: (hit: any) => {
      return hit.highlight?.['content.html']?.[0] && formatHighlight(hit.highlight['content.html']?.[0])
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(getFieldValue(hit, 'rawData.KNR'), getFieldValue(hit, 'rawData.GNR'), getFieldValue(hit, 'rawData.BNR'), "/", hit, display)
    }
  },
  leks_g: {
    title: defaultTitle,
    snippet: (hit: any) => {
      return hit.highlight?.['content.text'][0] && formatHighlight(hit.highlight['content.text'][0])
    },
    details: (hit: any, display: string) => {
      return 
    }
  },
  bsn: {
    title: (hit: any, display: string) => {
      let loktypes = getFieldValue(hit, 'rawData.stnavn.loktype')
      if (Array.isArray(loktypes)) {
        loktypes = loktypes.map((type: any) => type.type).join(', ')
      }
      else {
        loktypes = loktypes?.type
      }
      return <>{defaultTitle(hit)} {loktypes && ` (${loktypes.toLowerCase()})`}</>
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(getFieldValue(hit, 'tmp.knr'), getFieldValue(hit, 'rawData.stnavn.sted.gårdsnr'), getFieldValue(hit, 'rawData.stnavn.sted.bruksnr'), "/", hit, display)
    }
  },
  hord: {
    title: (hit: any, display: string) => {
      return <><span className="font-semibold">{getFieldValue(hit, 'label')}{getFieldValue(hit, 'altLabels') ? ', ':''}</span>{getFieldValue(hit, 'altLabels')}</> 
    },
    details: (hit: any, display: string) => {
      return <>{cadastreAdm(getFieldValue(hit, 'rawData.kommuneNr'), getFieldValue(hit, 'rawData.bruka.bruk.gardsNr'), getFieldValue(hit, 'rawData.bruka.bruk.bruksNr'), "/", hit, display)}
      {!hit.highlight && getFieldValue(hit, 'rawData.merknader') ? 
        <><br/>{getFieldValue(hit, 'rawData.merknader')?.slice(0,100)}{getFieldValue(hit, 'rawData.merknader')?.length > 100 ? '...' : ''}
        </> : ''} 
        </>
    }
  },
  nbas: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
      return <>{defaultTitle(hit)}{getFieldValue(hit, 'sosi') && <>&nbsp;{`(${getFieldValue(hit, 'sosi')})`}</>}</>
    },
    details: (hit: any, display: string) => {
      return formatAdm(hit)
    }
  },
  m1838: {
    title: (hit: any, display: string) => {
      return <>{defaultTitle(hit)}{getFieldValue(hit, 'sosi') && <>&nbsp;{`(${getFieldValue(hit, 'sosi')})`}</>}</>
    },
    details: (hit: any, display: string) => {
      return <>{getFieldValue(hit, 'misc.MNR')}{getFieldValue(hit, 'misc.LNR')?.[0] ? "." + getFieldValue(hit, 'misc.LNR')[0] : ""}, {formatAdm(hit)}</>
    }
  },
  m1886: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
      return <>{defaultTitle(hit)}{getFieldValue(hit, 'sosi') && <>&nbsp;{`(${getFieldValue(hit, 'sosi')})`}</>}</>
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(getFieldValue(hit, 'knr'), getFieldValue(hit, 'misc.gnr'), getFieldValue(hit, 'misc.bnr'), "/", hit, display)
    }
  },
  mu1950: {
    title: (hit: any, display: string) => {
      if (display == 'table') return defaultTitle(hit)
      return <>{defaultTitle(hit)}{getFieldValue(hit, 'sosi') && <>&nbsp;{`(${getFieldValue(hit, 'sosi')})`}</>}</>
    },
    details: (hit: any, display: string) => {
      return cadastreAdm(getFieldValue(hit, 'knr'), getFieldValue(hit, 'misc.GNR'), getFieldValue(hit, 'misc.BNR'), "/", hit, display)
    }
  },
  skul: {
    details: (hit: any, display: string) => {
      return cadastreAdm(getFieldValue(hit, 'rawData.knr'), getFieldValue(hit, 'rawData.gnr'), getFieldValue(hit, 'rawData.bnr'), "/", hit, display)
    },
  },
  ostf: {
    title: (hit: any, display: string) => {
      return <><strong>{getFieldValue(hit, 'label')}</strong> </>
    },
    details: (hit: any, display: string) => {
      return <> {getFieldValue(hit, 'rawData.GNID')}{getFieldValue(hit, 'rawData.GNID') && ", "}{formatAdm(hit)}</>
    }
  },
  tot: {
    title: defaultTitle,
    details: (hit: any, display: string) => {
      return <>{getFieldValue(hit, 'adm2')}{getFieldValue(hit, 'adm1') && ', ' + getFieldValue(hit, 'adm1')}</>
      }
  },
  ssr2016: {
    title: defaultTitle,
    details: (hit: any, display: string) => {
      return <>{formatAdm(hit)}</>
    }
  },

  
  
}


export const defaultResultRenderer: DefaultRenderer = {
  title: defaultTitle,
  snippet: (hit: any) => {
    return formatHighlight(
      Object.entries(hit.highlight)
        .map(([key, value]) => {
          if (Array.isArray(value) && value.every(item => typeof item === 'string')) {
            return value.join('...');
          }
          return ''; // or handle the case where value is not a string array
        })
        .join('...')
    );
  },
  details: (hit: any, display: string) => {
    return formatAdm(hit)
  },
  sourceTitle: (hit: any) => {
    const labels = getFieldValue(hit, 'altLabels')?.filter((label: string) => 
      label !== getFieldValue(hit, 'label')
    ) || []

    getFieldValue(hit, 'attestations.label')?.forEach((attestation: string) => {
        if (!labels.includes(attestation) && attestation !== getFieldValue(hit, 'label')) {
            labels.push(attestation)
        }
    })
    return <>
    {getFieldValue(hit, 'label')}
                {getFieldValue(hit, 'sosi') && ` (${getFieldValue(hit, 'sosi')})`}
                {labels?.length > 0 &&
                    <span className="text-neutral-900">
                        {" - " +labels?.join(', ')}
                    </span>
                }
    </>
  },
  sourceDetails: (hit: any) => {
    return ""
  }
}