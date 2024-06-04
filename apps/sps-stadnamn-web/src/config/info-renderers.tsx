import GroupedChildren from '@/app/view/[dataset]/doc/[uuid]/grouped-children';
import InfoBox from '@/components/ui/infobox';
import Link from 'next/link';
import React from 'react';
import { PiFunnelBold } from 'react-icons/pi';



const getUniqueAltLabels = (source: any, prefLabel: string, altLabelKeys: string[]) => {
    const altLabels = altLabelKeys.map((key) => source[key]).filter((label: string) => label !== prefLabel && label);
    return [...new Set(altLabels)].join(', ')
  }


  function createMarkup(htmlString: string) {
    const decodedHtmlString = htmlString.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    return {__html: decodedHtmlString};
  }
  
  function HtmlString({htmlString}: {htmlString: string}) {
    return <div dangerouslySetInnerHTML={createMarkup(htmlString)} />;
  }

  const timelineData = [
    { year: 1838, spellings: ['Aas'] },
    { year: 1886, spellings: ['Aas'] },
    { year: 1890, spellings: ['Gjellestad vestre og østre', 'Aas'] },
    { year: 1950, spellings: ['Ås'] },
    { year: 2000, spellings: ['Ås'] },
  ]
  
  const Timeline2 = () => (
    <div className='flex items-top !mt-4'>
      {timelineData.map((item, index) => (
          <div key={index} className='flex sm:flex-col items-center'>
            <div className='flex items-center w-full'>
              <div className='w-[50%] border-t-2 border-primary-300' />
              <div><div className='w-3 h-3 bg-primary-500 rounded-full'></div></div>
              {index !== timelineData.length - 1 && <div className='w-[50%] border-t-2 border-primary-300' />}
            </div>
            <div className='flex gap-1 flex-col sm:text-center py-2 sm:py-0 sm:mt-2 px-4'>
              <Link href="/" className='block mb-1 font-bold'>{item.year}</Link>
              {item.spellings.length > 1 ?
              <ul className='!py-0'>
                {item.spellings.map((spelling, i) => (
                  <li className=' list-none !py-0' key={i}>{spelling}</li>
                ))}

              </ul>
              :
              <span>{item.spellings[0]}</span>
              }

            </div>
          </div>
      ))}
    </div>
  );




  const Timeline3 = () => (
    <div className='relative m-4'>
      
      {timelineData.map((item, index) => (
        <div key={index} className='flex items-center pb-2 relative'>
          <div className={`bg-primary-300 absolute w-1 left-0 top-0 ${index === timelineData.length -1 ? 'h-2' : 'h-full'} ${index === 0 && 'mt-2'}`}></div>
          <div className='w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-1'></div>
          <div className='ml-6'>
            <Link href="/" className='block mb-1 font-bold'>{item.year}</Link>
            {item.spellings.length > 1 ?
              <ul className='!py-0'>
                {item.spellings.map((spelling, i) => (
                  <li className=' list-none !py-0' key={i}>{spelling}</li>
                ))}

              </ul>
              :
              <span>{item.spellings[0]}</span>
              }
          </div>
        </div>
      ))}
    </div>
  );



  // merge the two into a responsive version

  const Timeline = () => (
    <div className='relative md:flex md:items-top mt-4'>
      {timelineData.map((item, index) => (
        <div key={index} className='flex md:flex-col items-center pb-2 md:pb-0  relative'>

            <div className='hidden md:flex items-center w-full'>
              <div className={`w-[50%] ${index !== 0 && 'border-t-2 border-primary-300'}`} />
              <div><div className='w-2 h-2 bg-primary-500 rounded-full'></div></div>
              {index !== timelineData.length - 1 && <div className='w-[50%] border-t-2 border-primary-300' />}
            </div>


          <div className={`md:hidden bg-primary-300 absolute w-1 left-0 top-0 ${index === timelineData.length -1 ? 'h-2' : 'h-full'} ${index === 0 && 'mt-2'}`}></div>
          <div className='md:hidden w-4 h-4 rounded-full bg-primary-500 absolute -left-1.5 top-1'></div>

          <div className='ml-6 md:ml-0 md:flex md:gap-1 md:flex-col md:text-center pb-2 md:py-0 md:mt-2 md:px-4 '>
            <Link href="/" className='block mb-1 font-bold'>{item.year}</Link>
            {item.spellings.length > 1 ?
              <ul className='!p-0'>
                {item.spellings.map((spelling, i) => (
                  <li className=' list-none !py-0' key={i}>{spelling}</li>
                ))}

              </ul>
              :
              <span>{item.spellings[0]}</span>
              }
          </div>
          
        </div>
      ))}
    </div>
  );

      

  
  







export const infoPageRenderers: Record<string, (source: any) => JSX.Element> = {
  search: (source: any) => {
    return <>
    <div className='space-y-8'>
    <span><strong>Stadnamn ID: </strong> {source.snid || 'Ikke definert'}</span>
    
    {Timeline()}
    </div>
    <GroupedChildren childIdentifiers={source.children}/>
    </>
  },
  rygh: (source: any) => {
    return <>
    {source.description && <div className='space-y-2'><HtmlString htmlString={source.description} /></div>}
    <InfoBox dataset={'rygh'} items={[
      {title: 'Stadnamn', value: source.label},
      {title: 'Lokalitetstype', value: source.type, sosi: true},
      {title: 'Herred', value: source.adm2},
      {title: 'Amt', value: source.adm1},
      {title: 'Kommunenummer', value: source.rawData.KNR},
      {
        title: 'Gardsnummer', 
        items: [...new Set(source.cadastre?.map((item: any) => item.gnr) as string[])].map((gnr: string) => ({
          value: gnr, 
          href: `/view/rygh?rawData.KNR=${encodeURIComponent(source.rawData.KNR)}&cadastre__gnr=${encodeURIComponent(gnr)}`
        })),
      },
      {
        title: 'Bruksnummer', 
        items: source.cadastre?.map((item: any) => ({
          value: item.bnr, 
          href: `/view/rygh?rawData.KNR=${encodeURIComponent(source.rawData.KNR)}&cadastre__gnr=${encodeURIComponent(item.gnr)}&cadastre__bnr=${encodeURIComponent(item.bnr)}`
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
  bsn: (source: any) => {
    return <>
    <div className='space-y-2'>
    {source.rawData?.original?.stnavn?.komm ?
     <div><strong className="text-neutral-900">Merknad: </strong>{source.rawData.original.stnavn?.komm}</div>
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
                    'rawData.original.stnavn.sted__gårdsnr': source.rawData?.original?.stnavn?.sted?.gårdsnr
                  }}]
                },
                {
                  title: 'Gardsnummer',
                  items: [{value: source.rawData?.supplemented?.gnr, hrefParams: {
                    'rawData.supplemented.knr': source.rawData?.supplemented?.knr,
                    'rawData.supplemented.gnr': source.rawData?.supplemented?.gnr,
                  }}]
                },
                {
                  title: 'Bruksnummer',
                  items: [{value: !source.rawData?.original && source.rawData?.original?.stnavn?.sted?.bruksnr, hrefParams: {
                    'rawData.adm2': source.adm2,
                    'rawData.adm1': source.adm1,
                    'rawData.original.stnavn.sted__bruksnr': source.rawData?.original?.stnavn?.sted?.bruksnr,
                    'rawData.original.stnavn.sted__gårdsnr': source.rawData?.original?.stnavn?.sted?.gårdsnr
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
      {title: 'Lokalitetstype', value: source.type, sosi: true},
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
      {title: 'GNIDu', value: source.rawData?.gnidu},
    ]}/>

    </>
  },
  m1886: (source: any) => {
    return <>
    {source.rawData?.merknader && <><strong className="text-neutral-900">Merknad: </strong>{source.rawData?.merknader}</>}
    </>
  },    
  ostf: (source: any) => {
      return <>
      { source.links?.length &&
      <div>
      <h3>Lenker</h3>
      <ul className='!mt-0 !list-none !pl-0'>
        {source.links.map((link: any, index: number) => (
          <li key={index}><Link href={link} target="_blank" className=''>{link}</Link></li>
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