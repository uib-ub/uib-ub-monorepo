import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ChevronRightIcon, ChevronLeftIcon } from '@radix-ui/react-icons'
import Link from 'next/link'
import ImageBox from '../image-box'
import { SanityImageAssetDocument } from 'next-sanity'
import { Badge } from '../ui/badge'
import { Separator } from '../ui/separator'

type DetailsHeaderProps = {
  label?: string
  shortDescription?: string
  hasType?: {
    id: string
    label: string
  }[]
  period?: string
  logo?: SanityImageAssetDocument
  continued?: any[]
  continuedBy?: any[]
}

export const DetailsHeader = ({ data }: { data: DetailsHeaderProps }) => {
  return (
    <div className='grid grid-cols-1 gap-5'>
      <div className='grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-3 pb-2 w-full'>

        <div className='flex flex-col'>
          <div className="flex gap-3 pb-2 w-full">
            {data?.logo ? (
              <div className='w-[100px] h-[100px]'>
                <ImageBox image={data.logo} width={200} height={200} alt="" classesWrapper='relative aspect-[1/1]' />
              </div>
            ) : null}
          </div>
          <div>
            <h1 className='text-5xl mb-2'>{data?.label}</h1>
            {data?.shortDescription ? (<p>{data.shortDescription}</p>) : null}
          </div>

          <div>
            {data?.continued ? (
              <div>
                <Popover>
                  <PopoverTrigger className='flex items-center'><ChevronLeftIcon className='w-10 h-10' /> Fortsatte</PopoverTrigger>
                  <PopoverContent>
                    {data.continued.map((e: any) => (
                      <Link key={e.id} href={`/projects/${e.id}`}>
                        {e.label}
                      </Link>
                    ))}
                  </PopoverContent>
                </Popover>
              </div>
            ) : null}

            {data?.continuedBy ? (
              <div className="ml-auto">
                <Popover>
                  <PopoverTrigger className='flex aspect-square border'> <ChevronRightIcon className='w-10 h-10' /> Fortsatt av </PopoverTrigger>
                  <PopoverContent>
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
        </div>

        <Separator orientation='vertical' className='hidden md:block' />

        <div className=''>
          <dl className='flex flex-wrap flex-col gap-4 md:gap-5'>
            {data?.hasType && data.hasType.length > 0 ? (
              <div>
                <dt className='text-muted-foreground'>Type</dt>
                <dd className='flex flex-wrap gap-2'>
                  {data.hasType.map(tag => (
                    <Badge key={tag.id} variant={'secondary'} className=''>{tag.label}</Badge>
                  ))}
                </dd>
              </div>
            ) : null}

            {data?.period ? (
              <div>
                <dt className='text-muted-foreground'>Periode</dt>
                <dd className='flex flex-wrap gap-2'>
                  {data.period}
                </dd>
              </div>
            ) : null}
          </dl>


        </div>

      </div>
    </div>
  )
}