import { EditIntentButton } from '@/components/edit-intent-button'
import ImageBox from '@/components/image-box'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLinkIcon, QuoteIcon } from '@radix-ui/react-icons'
import { SanityDocument, SanityImageAssetDocument, groq } from 'next-sanity'
import { PortableTextBlock } from 'sanity'
import { Participants } from '../../../../components/participants'
import Link from 'next/link'
import { BiSubdirectoryRight } from 'react-icons/bi'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CustomPortableText } from '@/components/custom-protable-text'
import { ScrollArea } from '@/components/ui/scroll-area'
import { path } from '@/lib/utils'
import { Alert, AlertTitle } from '@/components/ui/alert'

export const query = groq`*[_id == $id][0] {
  "id": _id,
  "type": _type,
  "label": label,
  hasType[]-> {
    "id": _id,
    label
  },
  shortDescription,
  quote,
  image,
  "period": timespan.edtf,
  referredToBy[],
  link,
  hasFile[] {
    _key,
    label,
    "url": accessPoint.asset -> url,
    "extension": accessPoint.asset -> extension
  },
  "subGroupOf": subGroupOf|order(label)[]-> {
    "id": _id,
    hasType[]-> {
      "id": _id,
      label
    },
    label,
    shortDescription,
  },
  "hasSubGroup": *[_type == "Group" && ^._id in subGroupOf[]._ref]|order(label){
    "id": _id,
    hasType[]-> {
      "id": _id,
      label
    },
    label,
    shortDescription,
  },
  "mentions": *[references($id) && _type in ['Software', 'VolatileSoftware', 'Product', 'Project', 'Group']] | order(timespan.beginOfTheBegin asc)  {
    "id": _id,
    "type": _type,
    label,
  },
  "hasMember": hasMember[] {
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
      "active": "Aktiv" 
    },
    timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
      "active": "Avsluttet" 
    },
  },
  "groups": *[_type in ['Group'] && !references('dd4c1492-5e15-4d18-a7f2-0b8b8f95964d')] | order(label asc)  {
    "id": _id,
    "type": _type,
    label,
    hasType[]-> {
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
    "subGroupOf": [...subGroupOf[]->._id][0],
    hasMember[] {
      "id": assignedActor->._id,
      "label": assignedActor->.label,
      "timespan": timespan.edtf,
      "role": assignedRole[]->label,
    },
    image,
    shortDescription,
  },
  "connectedToProject": *[$id in hasTeam[]._ref][0] {
    "id": _id,
    "type": _type,
    label,
    logo,
  }
}`

export interface GroupProps extends SanityDocument {
  id: string
  type: string
  label: string
  hasType: {
    id: string
    label: string
  }[]
  quote: string
  image: SanityImageAssetDocument
  shortDescription: string
  period: string
  referredToBy: PortableTextBlock[]
  hasMember: {
    assignedActor: {
      id: string
      label: string
    }
    assignedRole: {
      id: string
      label: string
    }[]
    timespan: string
    active: string
  }[]
  hasFile: {
    _key: string
    label: string
    url: string
    extension: string
  }[]
  mentions: {
    id: string
    type: string
    label: string
  }[]
}

const Group = ({ data = {} }: { data: Partial<GroupProps> }) => {
  return (
    <div>
      <div className="flex flex-row gap-3 pb-2 w-full">
        {data?.image ? (
          <div className='w-[100px] h-[100px]'>
            <ImageBox image={data.image} width={200} height={200} alt="" classesWrapper='relative aspect-[1/1]' />
          </div>
        ) : null}
        <div className='flex flex-col'>
          <h1 className='text-5xl mb-2'>{data?.label}</h1>
          {data?.shortDescription ? (<p>{data.shortDescription}</p>) : null}
          {data?.quote ? (<p className='italic'><QuoteIcon className='inline-block' /> {data.quote}</p>) : null}
        </div>
      </div>

      <Tabs orientation='vertical' defaultValue="general">
        <div>
          <TabsList className='flex justify-start items-start h-fit mt-2 p-0 bg-transparent border-b w-full'>
            <TabsTrigger value="general" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
              Generelt
            </TabsTrigger>
            <EditIntentButton variant={'link'} id={data.id} className='p-0 m-0 pb-1 px-3 ml-auto text-muted-foreground text-sm font-medium' />
          </TabsList>
        </div>

        <TabsContent value="general" className='pt-4'>
          <div className='grid grid-cols-3 gap-4'>

            <Card className='col-span-2 row-span-5'>
              <CardHeader>
                <CardTitle>Medlemmer</CardTitle>
              </CardHeader>
              <CardContent>
                <Participants data={data.hasMember} />
              </CardContent>
            </Card>

            {data?.hasType ? (
              <Card>
                <CardHeader>
                  <CardTitle>Kategorier</CardTitle>
                </CardHeader>
                <CardContent>{data.hasType.map(tag => (
                  <Badge key={tag.id} variant={'secondary'}>{tag.label}</Badge>
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


            {data?.connectedToProject ? (
              <Card>
                <CardHeader>
                  <CardTitle>Knyttet til: <i>{data.connectedToProject.type}</i></CardTitle>
                </CardHeader>
                <CardContent>
                  {data.connectedToProject.logo ? (
                    <div className='w-[45px] h-[45px]'>
                      <ImageBox image={data.connectedToProject.logo} width={200} height={200} alt="" classesWrapper='relative aspect-[1/1]' />
                    </div>
                  ) : null}
                  <Link href={`/${path[data.connectedToProject.type]}/${data.connectedToProject.id}`} className='underline underline-offset-2'>
                    {data.connectedToProject.label}
                  </Link>
                </CardContent>
              </Card>
            ) : null}


            {/* @ts-ignore */}
            {data.referredToBy?.[0]?.body ? (
              <Card>
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



            {(data.subGroupOf?.length > 0 || data.hasSubGroup) && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Organisering
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.subGroupOf?.length > 0 ? (
                    <ul className='mt-2'>
                      {data.subGroupOf.map((group: any) => (
                        <li key={group.id}>
                          <Link className='underline underline-offset-2' href={`/group/${group.id}`}>
                            {group.label}
                          </Link>
                        </li>
                      ))}
                      <ul>
                        <li className='font-light'>
                          <BiSubdirectoryRight className="inline-block" />
                          {data.label}
                        </li>
                        {data.hasSubGroup && (
                          <ul>
                            {data.hasSubGroup.map((group: any) => (
                              <li key={group.id} className='ml-3'>
                                <Link className='underline underline-offset-2' href={`/groups/${group.id}`}>
                                  <BiSubdirectoryRight className="inline-block" />
                                  {group.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </ul>
                    </ul>
                  ) : (
                    <Alert>
                      <AlertTitle>
                        Ingen eier enhet registrert
                      </AlertTitle>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}


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
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Filer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertTitle>
                      Ingen filer
                    </AlertTitle>
                  </Alert>
                </CardContent>
              </Card>
            )}

          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Group