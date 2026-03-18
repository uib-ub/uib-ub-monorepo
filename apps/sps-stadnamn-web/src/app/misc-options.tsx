'use client'
import { useDatasetTag } from '@/lib/param-hooks'
import { useRouter, useSearchParams } from 'next/navigation'
export default function MiscOptions() {
  const searchParams = useSearchParams()
  const router = useRouter()
  return <div className="flex flex-wrap gap-4 px-4 py-6">
    <label className="flex gap-3 items-start text-lg">
      <input
        type="checkbox"
        name="datasetTag"
        value="deep"
        checked={useDatasetTag() == 'deep'}
        className="mt-1 h-3 w-3 xl:h-4 xl:w-4"
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const newUrl = new URLSearchParams(searchParams);
          if (event.target.checked) {
            newUrl.set('datasetTag', 'deep');
            newUrl.delete('init')
            newUrl.delete('group')
          }
          else {
            newUrl.delete('datasetTag');
          }
          router.push(`?${newUrl.toString()}`);
        }}
      />
      <div className="flex flex-col">
        <span className="text-lg">Stadnamnsamlingar</span>
        <span className="text-sm text-neutral-700">
          Vis berre kjeldeoppslag frå oppslagsverk og stadnamninnsamlingar
        </span>
      </div>
    </label>

  </div>
}