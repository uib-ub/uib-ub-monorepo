import { ItemContextMenu } from '@/components/edit-intent-button'
import ImageBox from '@/components/image-box'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SanityDocument, SanityImageAssetDocument, groq } from 'next-sanity'
import { PortableTextBlock } from 'sanity'
import { Participants } from '@/components/participants'
import { CustomPortableText } from '@/components/custom-protable-text'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ComputingCard, SoftwareCard } from './software-card'
import { path, pick } from '@/lib/utils'
import Link from 'next/link'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { DetailsHeader } from '@/components/shared/details-header'

export const query = groq`*[_id == $id][0] {
  "id": _id,
  "type": _type,
  label,
  hasType[]-> {
    "id": _id,
    label,
  },
  shortDescription,
  referredToBy[],
  logo,
  "websiteUrl": coalesce(
    websiteUrl,
    hostedBy[][0]->.designatedAccessPoint->.value,
  ),
  externalSoftware == null || externalSoftware == false => {
    "madeByUB": true,
  },
  externalSoftware == true => {
    "madeByUB": false,
  },
  programmedWith[]-> {
    "id": _id,
    "type": _type,
    label
  },
  uses[]-> {
    "id": _id,
    "type": _type,
    label,
    logo,
  },
  "usedIn": *[$id in uses[]._ref || $id in provisionedBy[]._ref] {
    "id": _id,
    "type": _type,
    label,
    logo,
  },
  currentOrFormerManager[] {
    assignedActor -> {
      "id": _id,
      "type": _type,
      label,
    },
    assignedRole[] -> {
      "id": _id,
      "type": _type,
      label,
    },
    "period": timespan.edtf,
    "active": "Aktiv",
    !defined(timespan) => {
      "active": "Ukjent" 
    },
    timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
      "active": "Avsluttet" 
    },
  },
  runBy[]-> {
    "id": _id,
    "type": _type,
    label,
    "period": timespan.edtf,
    providedBy-> {
      "id": _id,
      "type": _type,
      label,
      logo,
    },
    accessPoint[]->{
      "id": _id,
      "type": _type,
      label,
      value,
    },
    designatedAccessPoint-> {
      "type": _type,
      value,
    },
    runsOnRequest-> {
      "id": _id,
      "type": _type,
      label,
    },
  },
  hasSoftwarePart[]-> {
    "id": _id,
    "type": _type,
    label,
    hasType[]-> {
      "id": _id,
      label,
    },
    programmedWith[]-> {
      "id": _id,
      "type": _type,
      label
    },
    uses[]-> {
      "id": _id,
      "type": _type,
      label,
      logo,
    },
    runBy[]-> {
      "id": _id,
      "type": _type,
      label,
      "period": timespan.edtf,
      providedBy-> {
        "id": _id,
        "type": _type,
        label,
        logo,
      },
      accessPoint[]-> {
        "id": _id,
        "type": _type,
        label,
        value,
      },
      designatedAccessPoint-> {
        "type": _type,
        value,
      },
      runsOnRequest-> {
        "id": _id,
        "type": _type,
        label,
      },
      provisionedBy[]-> {
        "id": _id,
        "type": _type,
        label,
      },
    },
    hostedBy[]-> {
      "id": _id,
      "type": _type,
      label,
      logo,
      "period": timespan.edtf,
      hasPlatformCapability,
      hasComputingCapability,
      remoteName,
      componentOf-> {
        "id": _id,
        "type": _type,
        label,
        "logo": providedBy->.logo,
      },
      designatedAccessPoint-> {
        "type": _type,
        value,
      },
    },
  },
  "resultOf": *[$id in resultedIn[]._ref] {
    ...,
    "id": _id,
    "type": _type,
    "period": timespan.edtf,
    label,
    logo,
  }
}`

export type SoftwareComputingEService = {
  id: string
  type: string
  label: string
  period: string
  provisionedBy: {
    id: string
    type: string
    label: string
  }[]
  providedBy: {
    id: string
    type: string
    label: string
    logo: SanityImageAssetDocument
  }
  accessPoint: {
    id: string
    type: string
    label: string
    value: string
  }[]
  designatedAccessPoint: {
    type: string
    value: string
  }
}

export type VolatileSoftware = {
  id: string
  type: string
  label: string
  hasType: {
    id: string
    label: string
  }[],
  programmedWith: {
    id: string
    label: string
  }[],
  uses: {
    id: string
    label: string
  }[],
  runBy: SoftwareComputingEService[]
  hostedBy: {
    id: string
    type: string
    label: string
    period: string
    hasPlatformCapability: boolean
    hasComputingCapability: boolean
    remoteName: string
    componentOf: {
      id: string
      type: string
      label: string
      logo: SanityImageAssetDocument
    }
    designatedAccessPoint: {
      type: string
      value: string
    }
  }[]
}

export type SoftwareProps = SanityDocument & {
  id: string
  type: string
  label: string
  hasType: {
    id: string
    label: string
  }[]
  quote: string
  logo: SanityImageAssetDocument
  shortDescription: string
  websiteUrl: string
  madeByUB: boolean
  period: string
  referredToBy: {
    _key: string
    _type: string
    accessState: string
    editorialState: string
    body: PortableTextBlock[]
  }[]
  uses: {
    id: string
    label: string
  }[]
  programmedWith: {
    id: string
    label: string
  }[]
  currentOrFormerManager: {
    assignedActor: {
      id: string
      type: string
      label: string
    }
    assignedRole: {
      id: string
      label: string
    }[]
    period: string
    active: string
  }[]
  hasSoftwarePart: VolatileSoftware[],
  resultOf: {
    id: string
    type: string
    label: string
    logo: SanityImageAssetDocument
    period: string
  }[]
}

const Software = ({ data = {} }: { data: Partial<SoftwareProps> }) => {
  const detailsHeaderData = pick(data, 'label', 'shortDescription', 'hasType', 'period', 'logo', 'continued', 'continuedBy')
  return (
    <div>
      <DetailsHeader data={detailsHeaderData} />

      <Tabs orientation='horizontal' defaultValue="general">
        <TabsList className='flex justify-start items-start h-fit mt-2 p-0 bg-transparent border-b w-full'>
          <TabsTrigger value="general" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Generelt</TabsTrigger>
          <TabsTrigger value="data" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Data</TabsTrigger>
          <ItemContextMenu variant={'link'} id={data.id} className='p-0 m-0 pb-1 px-3 ml-auto text-muted-foreground text-sm font-medium' />
        </TabsList>

        <TabsContent value="general" className='pt-4'>
          <div className='grid grid-cols-3 gap-4'>
            <Card className='col-span-3 pt-4'>
              <CardContent>
                <dl className='flex flex-wrap flex-col md:flex-row gap-4 md:gap-10'>
                  {data?.websiteUrl ? (
                    <div>
                      <dt className='text-muted-foreground'>Nettside</dt>
                      <dd className='flex flex-wrap gap-3'>
                        <Link href={data.websiteUrl} target='_blank' className='flex items-baseline gap-1 underline underline-offset-2'>
                          {data?.websiteUrl} <ExternalLinkIcon />
                        </Link>
                      </dd>
                    </div>
                  ) : null}

                  {data?.programmedWith && data?.programmedWith.length > 0 ? (
                    <div>
                      <dt className='text-muted-foreground'>Programmeringsspråk</dt>
                      <dd className='flex flex-wrap gap-3'>
                        {data.programmedWith.map((s: any, i: number) => (
                          <Link key={s.id} href={`/${path[s.type]}/${s.id}`} className='underline underline-offset-2'>
                            {s.label}
                          </Link>
                        ))}
                      </dd>
                    </div>
                  ) : null}

                  {data?.uses && data?.uses.length > 0 ? (
                    <div>
                      <dt className='text-muted-foreground'>Bruker programvare</dt>
                      <dd className='flex flex-wrap gap-3'>
                        {data.uses.map((s: any, i: number) => (
                          <div key={s.id} className='flex gap-2'>
                            {s.logo ? (
                              <div className='w-[25px] h-[25px]'>
                                <ImageBox image={s.logo} width={25} height={25} alt="" classesWrapper='relative aspect-[1/1]' />
                              </div>
                            ) : null}
                            <Link href={`/${path[s.type]}/${s.id}`} className='underline underline-offset-2'>
                              {s.label}
                            </Link>
                          </div>
                        ))}
                      </dd>
                    </div>
                  ) : null}


                  {data?.resultOf && data?.resultOf?.length > 0 ? (
                    <div>
                      <dt className='text-muted-foreground'>Resultat av</dt>
                      <dd className='flex flex-wrap gap-3'>
                        {data.resultOf.map((result: any, i: number) => (
                          <div key={result?.id} className='flex gap-2'>
                            {result?.logo ? (
                              <div className='w-[50px] h-[50px]'>
                                <ImageBox image={result?.logo} width={50} height={50} alt="" classesWrapper='relative aspect-[1/1]' />
                              </div>
                            ) : null}
                            <Link href={`/${path[result?.type]}/${result?.id}`} className='underline underline-offset-2'>
                              {result?.label}
                              <br />
                            </Link>
                            <Badge variant={'outline'}>{result?.type}</Badge>
                          </div>
                        ))}
                      </dd>
                    </div>
                  ) : null}

                </dl>
              </CardContent>
            </Card>

            {data?.usedIn && data?.usedIn.length > 0 ? (
              <div className='col-span-3 flex flex-col gap-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Benyttet i</CardTitle>

                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-col gap-3'>
                      {data.usedIn.map((s: any, i: number) => (
                        <div key={s.id} className='flex gap-2'>
                          {s.logo ? (
                            <div className='w-[25px] h-[25px]'>
                              <ImageBox image={s.logo} width={25} height={25} alt="" classesWrapper='relative aspect-[1/1]' />
                            </div>
                          ) : null}
                          <Link href={`/${path[s.type]}/${s.id}`} className='underline underline-offset-2'>
                            {s.label}
                          </Link>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}



            {/* @ts-ignore */}
            {data.referredToBy?.[0]?.body ? (
              <Card className=''>
                <CardHeader>
                  <CardTitle>Beskrivelse</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] max-w-prose rounded-md border p-4 mt-2 mb-5">
                    {/* @ts-ignore */}
                    <CustomPortableText value={data.referredToBy[0].body} paragraphClasses='py-2 max-w-xl' />
                  </ScrollArea>
                </CardContent>
              </Card>
            ) : null}

            {data?.currentOrFormerManager ? (
              <Card className='col-span-3 md:col-span-2'>
                <CardHeader>
                  <CardTitle>Ansvarlige</CardTitle>
                </CardHeader>
                <CardContent>
                  <Participants data={data.currentOrFormerManager} config={{ activeFilter: false }} />
                </CardContent>
              </Card>
            ) : null}

            {data?.runBy && data?.runBy.length > 0 ? (
              <div className='col-span-3 flex flex-col gap-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Kjører på</CardTitle>
                    <CardDescription>Programvare som ikke er utviklet av UB eller er basert på <i>libraries</i>, men som driftes og <i>deploy</i>-es av UB.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid grid-cols-2 gap-4'>
                      {data.runBy.map((s: SoftwareComputingEService, i: number) => (
                        <ComputingCard data={s} key={i} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {data?.hasSoftwarePart ? (
              <div className='col-span-3 flex flex-col gap-3'>
                <Card>
                  <CardHeader>
                    <CardTitle>Programvaren-deler</CardTitle>
                    <CardDescription>Et stykke programvare kan ha mange deler som har avhengigheter til hverandre</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className='grid auto-flow-dense grid-cols-1 md:grid-cols-2 gap-4'>
                      {data?.hasSoftwarePart.map((s, i) => (
                        <SoftwareCard data={s} key={i} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="data" className='text-sm pt-4'>
          <pre className='p-4 border rounded-lg'>{JSON.stringify(data, null, 2)}</pre>
        </TabsContent>
      </Tabs>
    </div >
  )
}

export default Software