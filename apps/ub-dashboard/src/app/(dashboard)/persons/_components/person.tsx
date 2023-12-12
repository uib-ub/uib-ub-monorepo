import ImageBox from '@/components/image-box'
import { QuoteIcon } from '@radix-ui/react-icons'
import { SanityDocument, SanityImageAssetDocument, groq } from 'next-sanity'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PortableTextBlock } from 'sanity'
import { Skills } from './skills'
import { MemberOf } from './member-of'
import { EditIntentButton } from '@/components/edit-intent-button'
import { ResponsibleFor } from './responsibleFor'
import { CustomPortableText } from '@/components/custom-protable-text'
import Timeline from '@/components/timeline'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { SkillListProps, TimelineProps } from '@/types'

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
  "active": "Aktiv",
  !defined(timespan) => {
    "active": "Ukjent" 
  },
  timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
    "active": "Avsluttet" 
  },
  referredToBy[],
  "hasSkill": hasSkill[] | order(level desc) {
    "id": competence->._id,
    "type": competence->._type,
    "label": competence->.label,
    level,
    shortDescription,
  },
  "currentOrFormerManagerOf": *[$id in currentOrFormerManager[].assignedActor._ref]{
    "id": _id,
    "type": _type,
    label,
    "timespan": timespan.edtf,
  },
  "mentions": *[references($id) && _type in ['Software', 'VolatileSoftware', 'Product', 'Project', 'Group']] | order(timespan.beginOfTheBegin asc)  {
    "id": _id,
    "type": _type,
    label,
  },
  "memberOf": *[_type in ['Group'] && references(^._id)] | order(label) {
    "id": _id,
    label,
    hasType[]-> {
      "id": _id,
      label
    },
    hasMember[assignedActor._ref == $id] {
      assignedRole[]-> {
        "id": _id,
        label,
      },
      "timespan": timespan.edtf,
      defined(timespan.endOfTheEnd) == true => {
        "retired": true 
      }
    },
    "timespan": timespan.edtf,
    "active": "Aktiv",
    !defined(timespan) => {
      "active": "Ukjent" 
    },
    timespan.endOfTheEnd != '' && timespan.endOfTheEnd <= now() => {
      "active": "Avsluttet" 
    },
  },
  "timeline": [
    ...*[_type in ['Event', 'Activity', 'Move', 'Joining', 'Leaving', 'TransferOfMember', 'BeginningOfExistence', 'EndOfExistence', 'Formation', 'Dissolution'] && references($id) && defined(timespan)] {
      "id": _id,
      "type": _type,
      "label": coalesce(label, 'Uten label'),
      "period": timespan.edtf,
      "timestamp": coalesce(
        select(
          timespan.date != "" => timespan.date
        ), 
        select(
          timespan.beginOfTheBegin != "" => timespan.beginOfTheBegin
        )
      )
    },
    ...*[_type in ['Project', 'Group'] && references($id) && defined(timespan.endOfTheEnd)] {
        ...select(defined(timespan.endOfTheEnd) => {
          "id": _id,
          "type": _type,
          "label": label + " avsluttes",
          "period": timespan.edtf,
          "timestamp": timespan.endOfTheEnd,
          "connectedTo": *[_type == 'Project' && ^._id in hasTeam[]._ref] {
            "id": _id,
            "type": _type,         
            label
          }
        }
      )
    },
    ...*[_type in ['Project', 'Group'] && references($id) && defined(timespan.beginOfTheBegin)] {
        ...select(defined(timespan.beginOfTheBegin) => {
          "id": _id,
          "type": _type,
          "label": label + " starter",
          "period": timespan.edtf,
          "timestamp": timespan.beginOfTheBegin,
          "connectedTo": *[_type == 'Project' && ^._id in hasTeam[]._ref] {
            "id": _id,
            "type": _type,         
            label
          }
        }
      )
    }
  ]
}`

export interface PersonProps extends SanityDocument {
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
  referredToBy: {
    body: (PortableTextBlock | any)[]
  }[]
  hasSkill: SkillListProps[]
  currentOrFormerManagerOf: {
    id: string
    type: string
    label: string
    timespan: string
  }[]
  mentions: {
    id: string
    type: string
    label: string
  }[]
  memberOf: {
    id: string
    label: string
    hasType: {
      id: string
      label: string
    }[]
    hasMember: {
      assignedRole: {
        id: string
        label: string
      }[]
      timespan: string
      retired: boolean
    }[]
    timespan: string
    active: boolean
  }[]
  timeline: TimelineProps[]
}

const Person = ({ data = {} }: { data: Partial<PersonProps> }) => {
  return (
    <div>
      <div className="flex flex-row gap-3 pb-2">
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

      <Tabs orientation='horizontal' defaultValue="general">
        <TabsList className='flex justify-start items-start h-fit mt-2 p-0 bg-transparent border-b w-full'>
          <TabsTrigger value="general" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Generelt
          </TabsTrigger>
          <TabsTrigger value="bio" disabled={data.referredToBy?.[0]?.body ? false : true} className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Bio
          </TabsTrigger>
          <TabsTrigger value="timeline" className="inline-flex items-center justify-center whitespace-nowrap py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background relative h-9 rounded-none border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:text-foreground data-[state=active]:shadow-none">
            Tidslinje
          </TabsTrigger>
          <EditIntentButton variant={'link'} id={data.id} className='p-0 m-0 pb-1 px-3 ml-auto text-muted-foreground text-sm font-medium' />
        </TabsList>

        <TabsContent value="general" className='pt-4'>
          <div className='grid grid-cols-6 gap-4'>
            <Card className='col-span-6'>
              <CardHeader>
                <CardTitle>Medlem av</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberOf data={data.memberOf} />
              </CardContent>
            </Card>

            <Card className='col-span-6 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Kompetanse</CardTitle>
              </CardHeader>
              <CardContent>
                <Skills data={data.hasSkill} />
              </CardContent>
            </Card>

            <Card className='col-span-6 lg:col-span-3'>
              <CardHeader>
                <CardTitle>Ansvar for</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsibleFor data={data.currentOrFormerManagerOf} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bio" className='pt-4'>
          <div className='p-5'>
            {data.referredToBy?.[0]?.body ? (
              <div className="max-w-prose m-auto">
                <h2>Biografi</h2>
                <CustomPortableText value={data.referredToBy[0].body} paragraphClasses='py-2 max-w-xl' />
              </div>
            ) : (
              <Alert>
                <AlertTitle>Det er ikke registrert noen biografi for denne personen.</AlertTitle>
              </Alert>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className='pt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Tidslinje</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.timeline && data?.timeline?.length > 0 ? (<Timeline data={data.timeline} />) : (
                <Alert>
                  <AlertTitle>Det er ikke registrert noen hendelser for denne personen.</AlertTitle>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default Person