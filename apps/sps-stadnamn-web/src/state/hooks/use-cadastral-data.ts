'use client'
import { useQuery } from '@tanstack/react-query'

const useCadastralData = (dataset: string | undefined, uuid: string | undefined) => {
  return useQuery({
    queryKey: ['cadastral', dataset, uuid],
    queryFn: async () => {
      if (!dataset || !uuid) return null

      const params = new URLSearchParams({
        perspective: dataset,
        within: uuid,
        size: '1000',
        asc: 'cadastre__gnr,cadastre__bnr'
      })

      const res = await fetch(`/api/search/table?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch cadastral data')
      return res.json()
    },
    enabled: !!dataset && !!uuid
  })
}

export default useCadastralData
