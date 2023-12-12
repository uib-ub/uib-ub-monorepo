import { Alert, AlertTitle } from '@/components/ui/alert'
import { Slider } from '@/components/ui/slider'
import { path } from '@/lib/utils'
import { SkillListProps } from '@/types'
import Link from 'next/link'
import { FaHatWizard } from 'react-icons/fa'

export const Skills = ({ data = [] }: { data?: SkillListProps[] }) => {
  return (
    <>
      {!data ? (
        <Alert>
          <AlertTitle>
            Kompentanse ikke registrert
          </AlertTitle>
        </Alert>
      ) : (
        <div className='flex flex-col'>
          <p className="mb-2 text-muted-foreground">Fra 1 til 10.</p>

          {data?.map((skill, index) => (
            <div key={index} className='grid grid-cols-2 gap-2 w-full'>
              <div className='w-2/3 flex-grow'>
                {path[skill.type] !== undefined ? (
                  <Link className='underline underline-offset-2' href={`/${path[skill.type]}/${skill.id}}`}>{skill.label}</Link>
                ) : skill.label}
              </div>
              <div className='flex gap-2 flex-grow'>
                <Slider
                  defaultValue={[skill.level]}
                  max={10}
                  step={1}
                  disabled={true}
                />
                <div className='w-1/3 flex gap-1 text-zinc-400 dark:text-zinc-300'>
                  {skill.level} {skill.level === 10 ? <FaHatWizard className='text-red-600 w-5 h-5' /> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
