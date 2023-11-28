import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { VolatileSoftware, SoftwareComputingEService } from './software'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ExternalLinkIcon } from '@radix-ui/react-icons'
import ImageBox from '@/components/image-box'
import { SanityImageAssetDocument } from 'next-sanity'
import { path } from '@/lib/utils'

export const ComputingCard = ({ data }: { data: any }) => {
  const { id, type, label, designatedAccessPoint, accessPoint, providedBy, provisionedBy } = data
  return (
    <Card key={id} className='rounded-sm flex flex-col bg-zinc-200 dark:bg-zinc-700'>
      <CardHeader className='p-2'>
        <CardTitle className='text-sm' >
          {label}
        </CardTitle>
        <CardDescription>
          {type}
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col flex-grow gap-2 px-2'>
        {accessPoint ? (
          <div>
            {accessPoint?.map((t: { value: any; label: string; }, i: number) => (
              <div className='text-muted-foreground text-sm flex items-center gap-1' key={i}>
                <ExternalLinkIcon className='inline-block w-3 h-3' />
                <a href={t.value} target='_blank' className='whitespace-nowrap overflow-x-scroll'>{t.value}</a>
              </div>
            ))}
          </div>
        ) : null}

        {provisionedBy?.length > 0 ? (
          <dl>
            <div>
              <dt className='text-muted-foreground'>Provisjonert av</dt>
              {provisionedBy.map((r: { id: any; label: any; designatedAccessPoint: { value: any; }; providedBy: { label: any; logo: SanityImageAssetDocument; }; type: any; }, i: number) => (
                <dd key={i}>
                  <Link href={`/${path[r.type]}/${r.id}`} className='underline underline-offset-2'>
                    {r.label}
                  </Link>
                </dd>
              ))}
            </div>
          </dl>
        ) : null}
      </CardContent>

      <CardFooter className='flex justify-start gap-2 border-t border-zinc-400 p-2'>
        {providedBy?.logo ? (
          <div className='w-[25px] h-[25px]'>
            <ImageBox image={providedBy.logo} width={45} height={45} alt="" classesWrapper='relative aspect-[1/1]' />
          </div>
        ) : null}
        {designatedAccessPoint?.value ? (
          <Link href={designatedAccessPoint?.value} target='_blank'>
            {providedBy?.label}
            <ExternalLinkIcon className='inline-block w-4 h-4 ml-1' />
          </Link>
        ) : providedBy?.label}
      </CardFooter>
    </Card>
  )
}

export const HostingSoftwareCard = ({ data }: { data: any }) => {
  const { type, label, designatedAccessPoint, runBy, componentOf } = data
  return (
    <Card className='flex flex-col rounded-sm bg-zinc-100 dark:bg-zinc-800 shadow-md justify-between'>
      <CardHeader className='p-2'>
        <CardTitle className='text-sm'>
          {label}
        </CardTitle>
        <CardDescription>
          {type}
        </CardDescription>
      </CardHeader>

      <CardContent className='px-2 pt-2 flex flex-col flex-grow gap-2'>
        {runBy?.length > 0 ? (
          runBy.map((r: { id: any; label: any; designatedAccessPoint: { value: any; }; providedBy: { label: any; logo: SanityImageAssetDocument; }; type: any; }, i: number) => (
            <ComputingCard key={i} data={r} />
          ))
        ) : null}
      </CardContent>

      <CardFooter className='flex justify-start gap-2 border-t border-zinc-300 p-2'>
        {componentOf?.logo ? (
          <div className='w-[25px] h-[25px]'>
            <ImageBox image={componentOf.logo} width={45} height={45} alt="" classesWrapper='relative aspect-[1/1]' />
          </div>
        ) : null}
        {designatedAccessPoint?.value ? (
          <Link href={designatedAccessPoint?.value} target='_blank'>
            {componentOf.label}
            <ExternalLinkIcon className='inline-block w-4 h-4 ml-1' />
          </Link>
        ) : componentOf.label}
      </CardFooter>
    </Card >
  )
}

export const SoftwareCard = ({ data }: { data: Partial<VolatileSoftware & SoftwareComputingEService> }) => {
  return (
    <Card className='rounded-sm flex flex-col bg-zinc-50 dark:bg-zinc-900'>
      <CardHeader className='p-3'>
        <CardTitle className='text-md'>
          {data.label}
        </CardTitle>
        <CardDescription>
          {data.type}
        </CardDescription>
      </CardHeader>

      <CardContent className='px-2 pt-2 flex-grow grid grid-flow-dense gap-2'>
        <dl className='w-full'>
          {data?.programmedWith && data?.programmedWith.length > 0 ? (
            <div>
              <dt className='text-muted-foreground'>Programmeringsspråk</dt>
              <dd className='flex flex-wrap gap-3'>
                {data.programmedWith.map((s: any, i: number) => (
                  <>
                    {s.label}
                    {/* <Link key={s.id} href={`/${path[s.type]}/${s.id}`} className='underline underline-offset-2'>
                    {s.label}
                  </Link> */}
                  </>
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
        </dl>

        {data.hostedBy?.map((t, i) => (
          <HostingSoftwareCard key={i} data={t} />
        ))}

        {data.runBy && data.runBy.length > 0 ? (
          data.runBy.map((r: { id: any; label: any; designatedAccessPoint: { value: any; }; providedBy: { label: any; logo: SanityImageAssetDocument; }; type: any; }, i: number) => (
            <ComputingCard key={i} data={r} />
          ))
        ) : null}
      </CardContent>

      <CardFooter className='flex justify-end border-t p-3'>
        {data.hasType && (
          <div className='flex flex-wrap items-center gap-2'>
            {data.hasType.map((t, i) => (
              <Badge variant="secondary" className='grow-0 text-xs' key={i}>
                {t.label ?? 'Mangler navn'}
              </Badge>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}