import { datasetTitles } from "@/config/metadata-config"

interface DatasetSummaryProps {
  datasetKeys: string[]
  className?: string
}

export function DatasetSummary({ datasetKeys, className }: DatasetSummaryProps) {
  const keys = datasetKeys.filter(Boolean)
  if (keys.length === 0) return null

  const titles = keys.map((k) => datasetTitles[k] || k)

  let text = ""
  if (titles.length === 1) {
    text = titles[0]!
  } else if (titles.length === 2) {
    text = `${titles[0]} og ${titles[1]}`
  } else {
    const first = titles[0]!
    const restCount = titles.length - 1
    text = `${first} +${restCount} andre`
  }

  return <span className={className}>{text}</span>
}

