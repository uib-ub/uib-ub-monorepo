import { ItemContextMenu } from '@/components/edit-intent-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import { SanityDocument, SanityImageAssetDocument, groq } from 'next-sanity'
import { PortableTextBlock } from 'sanity'
import { Participants } from '@/components/participants'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import millify from 'millify'
import { CustomPortableText } from '@/components/custom-protable-text'
import { ScrollArea } from '@/components/ui/scroll-area'
import { path, pick } from '@/lib/utils'
import { ProjectOrganizations } from '@/components/project-organizations'
import { DetailsHeader } from '@/components/shared/details-header'

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
    },
  },
  carriedOutBy[] {
    assignedActor -> {
      "id": _id,
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
    body: (PortableTextBlock | any)[]
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
    active: string
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
    active: string
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
  const detailsHeaderData = pick(data, 'label', 'shortDescription', 'hasType', 'period', 'logo', 'continued', 'continuedBy')
  return (
    <div>
      <DetailsHeader data={detailsHeaderData} />

      <Tabs orientation='vertical' defaultValue="general">
        <TabsList className='flex justify-start items-start h-fit mt-2 p-0 bg-transparent border-b w-full'>
          <TabsTrigger value="general" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Generelt
          </TabsTrigger>
          <TabsTrigger value="data" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">Data</TabsTrigger>
          <ItemContextMenu variant={'link'} id={data.id} className='p-0 m-0 pb-1 px-3 ml-auto text-muted-foreground text-sm font-medium' />
        </TabsList>

        <TabsContent value="general" className='pt-4'>
          <div className='grid grid-cols-6 gap-4'>
            {data?.funding?.filter(x => x.type === 'FundingActivity').length || data.resultedIn ? (
              <Card className='col-span-6'>
                <CardContent className='mt-4'>
                  <dl className='flex flex-wrap flex-col md:flex-row gap-4 md:gap-10'>
                    {data?.funding?.filter(x => x.type === 'FundingActivity').length ? (
                      <div>
                        <dt className='text-muted-foreground'>Finansiering</dt>
                        <dd className='flex flex-wrap gap-2'>
                          {data.funding.filter((obj: any) => !(obj && Object.keys(obj).length === 0)).map((f: any) => (
                            <Card key={f.id} className='p-2 rounded-sm'>
                              <CardHeader className='px-1 pt-0 pb-0'>
                                <CardTitle className='text-sm'>{f.awarder}</CardTitle>
                              </CardHeader>
                              <CardContent className='px-1 py-1 font-extrabold text-2xl'>
                                {f.amount > 999999.99 ? millify(f.amount, { precision: 2, locales: ['no'], space: true, units: ['', '', 'MILL', 'MRD'] }) : f.amount}  {f.currency}
                              </CardContent>
                              <CardFooter className='px-1 py-0 text-muted-foreground text-xs'>
                                <p>
                                  {f.period}
                                </p>
                              </CardFooter>
                            </Card>
                          ))}
                        </dd>
                      </div>
                    ) : null}

                    {data?.resultedIn ? (
                      <div>
                        <dt className='text-muted-foreground'>Resulterte i</dt>
                        <dd className='flex flex-wrap gap-2'>
                          {data.resultedIn.map((row) => (
                            <Link key={row.id} href={`/${path[row.type]}/${row.id}`} className='underline underline-offset-2'>
                              {row.label}
                            </Link>))}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </CardContent>
              </Card>
            ) : null}

            {data.referredToBy?.[0]?.body ? (
              <ScrollArea className="h-[250px] max-w-prose col-span-2 rounded-xl border p-4 mt-2 mb-5">
                <CustomPortableText value={data.referredToBy[0].body} paragraphClasses='py-2 max-w-xl' />
              </ScrollArea>
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
                            <Link href={file.url} target='_blank'>
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
              <Card className='col-span-2'>
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
                            <Link href={file.url} target='_blank'>
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
              <Card className='col-span-6'>
                <CardHeader>
                  <CardTitle>Prosjekteiere</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectOrganizations data={data.carriedOutBy} />
                </CardContent>
              </Card>
            ) : null}

            {data?.hadParticipant ? (
              <Card className='col-span-6'>
                <CardHeader>
                  <CardTitle>Andre Institusjoner</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProjectOrganizations data={data.hadParticipant} />
                </CardContent>
              </Card>
            ) : null}

            {data?.hasTeam ? (
              <Card className='col-span-6'>
                <CardHeader>
                  <CardTitle>Prosjektgrupper</CardTitle>
                </CardHeader>
                <CardContent className={`grid ${data.hasTeam.length > 1 ? 'grid-cols-2' : 'grid-cols-1'} gap-5`}>
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

        <TabsContent value="data" className='text-sm pt-4'>
          <pre className='p-4 border rounded-lg'>{JSON.stringify(data, null, 2)}</pre>
        </TabsContent>
      </Tabs >
    </div >
  )
}

export default Project