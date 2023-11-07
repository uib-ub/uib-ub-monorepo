import { EditIntentButton } from '@/components/edit-intent-button'
import ImageBox from '@/components/image-box'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChevronLeftIcon, ChevronRightIcon, ExternalLinkIcon } from '@radix-ui/react-icons'
import { SanityDocument, SanityImageAssetDocument, groq } from 'next-sanity'
import { PortableTextBlock } from 'sanity'
import { Participants } from '@/components/participants'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import millify from 'millify'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CustomPortableText } from '@/components/custom-protable-text'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResultedIn } from '@/components/resulted-in'

export const query = groq`*[_id == $id][0] {
  "id": _id,
  "type": _type,
  status,
  label,
  hasType[]-> {
    "id": _id,
    label
  },
  shortDescription,
  "period": timespan.edtf,
  referredToBy[],
  logo,
  link,
  hasFile[] {
    _key,
    label,
    "url": accessPoint.asset -> url,
    "extension": accessPoint.asset -> extension
  },
  continued[] -> {
    "id": _id,
    label
  },
  continuedBy[] -> {
    "id": _id,
    label
  },
  hasTeam[] -> {
    "id": _id,
    label,
    hasMember[] {
      assignedActor-> {
        "id": _id,
        "type": _type,
        label,
      },
      assignedRole[]-> {
        "id": _id,
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
    }
  },
  "identifier": identifiedBy[] {
    _type == 'Identifier' => {
      "id": _key,
      content,
      "type": hasType -> label
    }
  },
  "funding": activityStream[] -> {
    _type == 'FundingActivity' => {
    "id": _id,
    "type": _type,
      label,
      "awarder": awarder -> label,
      "amount": fundingAmount.value,
      "currency": fundingAmount.hasCurrency -> label,
      "period": timespan.edtf,
    }
  },
  carriedOutBy[] {
    assignedActor -> {
      "id": _id,
      "type": _type,
      label,
    },
    assignedRole[] -> {
      "id": _id,
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
  hadParticipant[] {
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
    }
  },
  resultedIn[]-> {
    _type != 'SoftwareComputingEService' => {
      "id": _id,
      "type": _type,
      "period": timespan.edtf,
      label,
      logo,
    },
    _type == 'SoftwareComputingEService' => {
      "id": *[_type == 'Software' && references(^._id)][0]._id,
      "type": *[_type == 'Software' && references(^._id)][0]._type,
      "period": timespan.edtf,
      "label": (*[_type == 'Software' && references(^._id)][0].label) + ' (' + label + ')',
      logo,
    },
  }
}`

export interface ProjectProps extends SanityDocument {
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
  period: string
  referredToBy: {
    _key: string
    _type: string
    accessState: string
    editorialState: string
    body: PortableTextBlock[]
  }[]
  link: {
    _key: string
    label: string
    url: string
  }[]
  continued: {
    id: string
    label: string
  }[]
  continuedBy: {
    id: string
    label: string
  }[]
  identifier: {
    id: string
    content: string
    type: string
  }[]
  funding: {
    id: string
    type: string
    label: string
    awarder: string
    amount: number
    currency: string
    period: string
  }[]
  carriedOutBy: {
    assignedActor: {
      id: string
      type: string
      label: string
    }
    assignedRole: {
      id: string
      label: string
    }[]
    timespan: string
  }[]
  hadParticipant: {
    assignedActor: {
      id: string
      type: string
      label: string
    }
    assignedRole: {
      id: string
      label: string
    }[]
    timespan: string
  }[]
  hasTeam: {
    id: string
    label: string
    period: string
    active: string
    hasMember: {
      assignedActor: {
        id: string
        type: string
        label: string
      }
      assignedRole: {
        id: string
        label: string
      }[]
      timespan: string
    }[]
  }[]
  hasFile: {
    _key: string
    label: string
    url: string
    extension: string
  }[]
  resultedIn: {
    id: string
    type: string
    period: string
    label: string
    logo: SanityImageAssetDocument
    usedService: {
      id: string
      type: string
      label: string
      period: string
    }[]
  }[]
}

const Project = ({ data = {} }: { data: Partial<ProjectProps> }) => {
  return (
    <div>
      <div className='flex items-center gap-3'>
        {data?.continued ? (
          <div>
            <Popover>
              <PopoverTrigger><ChevronLeftIcon className='w-10 h-10' /></PopoverTrigger>
              <PopoverContent>
                <p className='font-semibold italic'>
                  Fortsatte
                </p>
                {data.continued.map((e: any) => (
                  <Link key={e.id} href={`/projects/${e.id}`}>
                    {e.label}
                  </Link>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        ) : null}
        <div className="flex flex-row gap-3 pb-2 w-full">
          {data?.logo ? (
            <div className='w-[100px] h-[100px]'>
              <ImageBox image={data.logo} width={200} height={200} alt="" classesWrapper='relative aspect-[1/1]' />
            </div>
          ) : null}
          <div className='flex flex-col'>
            <h1 className='text-5xl mb-2'>{data?.label}</h1>
            {data?.shortDescription ? (<p>{data.shortDescription}</p>) : null}
          </div>

        </div>
        {data?.continuedBy ? (
          <div className="ml-auto">
            <Popover>
              <PopoverTrigger className='aspect-square border'>
                <ChevronRightIcon className='w-10 h-10' />
              </PopoverTrigger>
              <PopoverContent>
                <p className='font-semibold italic'>
                  Fortsatt av
                </p>
                {data.continuedBy.map((e: any) => (
                  <Link key={e.id} href={`/projects/${e.id}`}>
                    {e.label}
                  </Link>
                ))}
              </PopoverContent>
            </Popover>
          </div>
        ) : null}
      </div>

      <Tabs orientation='vertical' defaultValue="general">
        <TabsList className='flex justify-start items-start h-fit mt-2 p-0 bg-transparent border-b w-full'>
          <TabsTrigger value="general" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Generelt
          </TabsTrigger>
          <EditIntentButton variant={'link'} id={data.id} className='p-0 m-0 pb-1 px-3 ml-auto text-muted-foreground text-sm font-medium' />
        </TabsList>

        <TabsContent value="general" className='pt-4'>
          <div className='grid grid-cols-3 gap-4'>


            {data?.hasType ? (
              <Card>
                <CardHeader>
                  <CardTitle>Kategorier</CardTitle>
                </CardHeader>
                <CardContent className='p-0'>{data.hasType.map(tag => (
                  <Badge key={tag.id} variant={'secondary'} className='text-sm'>{tag.label}</Badge>
                ))}
                </CardContent>
              </Card>
            ) : null}
            {data?.period ? (
              <Card>
                <CardHeader>
                  <CardTitle>Periode</CardTitle>
                </CardHeader>
                <CardContent>{data.period}</CardContent>
              </Card>
            ) : null}

            {data?.funding ? (
              <Card>
                <CardHeader>
                  <CardTitle>Finansiering</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.funding.filter((obj: any) => !(obj && Object.keys(obj).length === 0)).map((f: any) => (
                    <Card key={f.id} className='p-1'>
                      <CardHeader className='px-3 pt-2 pb-0'>
                        <CardTitle className='text-sm'>{f.awarder}</CardTitle>
                      </CardHeader>
                      <CardContent className='px-3 py-1 font-extrabold text-2xl'>
                        {f.amount > 999999.99 ? millify(f.amount, { precision: 2, locales: ['no'], space: true, units: ['', '', 'MILL', 'MRD'] }) : f.amount}  {f.currency}
                      </CardContent>
                      <CardFooter className='px-3 py-0'>
                        <p>
                          {f.period}
                        </p>
                      </CardFooter>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ) : null}


            {/* @ts-ignore */}
            {data.referredToBy?.[0]?.body ? (
              <Card className='row-span-2'>
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

            {data?.resultedIn ? (
              <Card className='col-span-2'>
                <CardHeader>
                  <CardTitle>Resulterte i</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResultedIn data={data.resultedIn} config={{ activeFilter: false }} />
                </CardContent>
              </Card>
            ) : null}

            {data?.link ? (
              <Card className='col-span-2'>
                <CardHeader>
                  <CardTitle>Lenker</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lenke</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.link.map((file: any) => (
                        <TableRow key={file._key}>
                          <TableCell>
                            <Link href={file.url}>
                              {file.label}
                              <ExternalLinkIcon className='inline-block' />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                </CardContent>
              </Card>
            ) : null}

            {data?.hasFile ? (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Filer
                  </CardTitle>
                </CardHeader>
                <CardContent>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Filer</TableHead>
                        <TableHead>Format</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data?.hasFile.map((file: any) => (
                        <TableRow key={file._key}>
                          <TableCell>
                            <Link href={file.url}>
                              {file.label}
                              <ExternalLinkIcon className='inline-block' />
                            </Link>
                          </TableCell>
                          <TableCell>
                            <Badge variant='outline'>
                              {file.extension}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : null}



            {data?.carriedOutBy ? (
              <Card className='col-span-3'>
                <CardHeader>
                  <CardTitle>Prosjekteiere</CardTitle>
                </CardHeader>
                <CardContent>
                  <Participants data={data.carriedOutBy} config={{ activeFilter: false }} />
                </CardContent>
              </Card>
            ) : null}
            {data?.hadParticipant ? (
              <Card className='col-span-3'>
                <CardHeader>
                  <CardTitle>Andre Institusjoner</CardTitle>
                </CardHeader>
                <CardContent>
                  <Participants data={data.hadParticipant} config={{ activeFilter: false }} />
                </CardContent>
              </Card>
            ) : null}

            {data?.hasTeam ? (
              <Card className='col-span-3'>
                <CardHeader>
                  <CardTitle>Prosjektgrupper</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.hasTeam.map((team: any) => (
                    <div key={team.id}>
                      <h3 className='text-lg font-semibold mb-1'>{team.label}</h3>
                      <Participants data={team.hasMember} config={{ activeFilter: false }} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

          </div>
        </TabsContent>
      </Tabs >
    </div >
  )
}

export default Project