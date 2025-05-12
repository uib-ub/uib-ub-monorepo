import { datasetTypes } from "@/config/metadata-config";

import { publishDates } from "@/config/metadata-config";

export default function DatasetStats({ statsItem, itemDataset }: { statsItem: any, itemDataset: string }) {
    return <div className="flex">
        <div className="flex items-center gap-2">
    {statsItem?.doc_count && (
      <div className="flex items-center border border-neutral-200 rounded-md">
        <span className="font-medium text-neutral-950 p-0.5 px-2 bg-neutral-50 rounded-l-md border-r border-neutral-200">Oppslag</span>
        <span className="text-neutral-900 bg-white p-0.5 px-2 rounded-r-md">{statsItem.doc_count.toLocaleString()}</span>
      </div>
    )}
    {publishDates[itemDataset] && (
      <div className="flex items-center border border-neutral-200 rounded-md">
        <span className="font-medium text-neutral-950 p-0.5 px-2 bg-neutral-50 rounded-l-md border-r border-neutral-200">Lagt til</span>
        <span className="text-neutral-900 bg-white p-0.5 px-2 rounded-r-md ">{new Date(publishDates[itemDataset]).toLocaleDateString('no')}</span>
      </div>
    )}
    {datasetTypes[itemDataset]?.includes('updated') && (
      <div className="flex items-center border border-neutral-200 rounded-md">
        <span className="font-medium text-neutral-950 p-0.5 px-2 bg-neutral-50 rounded-l-md border-r border-neutral-200">Oppdatert</span>
        <span className="text-neutral-900 bg-white p-0.5 px-2 rounded-r-md">{new Date(parseInt(statsItem?.timestamp) * 1000).toLocaleDateString('no')}</span>
      </div>
    )}
    </div>
  </div>
}
