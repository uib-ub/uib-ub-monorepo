import { definePreview } from 'next-sanity/preview'
import { projectId, dataset } from 'lib/sanity.client'

const usePreview = definePreview({ projectId, dataset })
export default function PreviewDocumentsCount() {
  const data = usePreview(null, query)
  return <DocumentsCount data={data} />
}