import { datasetTypes } from "@/config/metadata-config";

import { publishDates } from "@/config/metadata-config";

export default function DatasetStats({ statsItem, itemDataset }: { statsItem: any, itemDataset: string }) {
    return <div className="flex flex-wrap gap-1.5 text-sm">
    {statsItem?.doc_count && (
      <div className="flex items-center">
        <span className="font-medium text-neutral-900 mr-1">Oppslag:</span>
        <span className="text-neutral-900 font-semibold">{statsItem.doc_count.toLocaleString()}</span>
      </div>
    )}
    {publishDates[itemDataset] && (
      <div className="flex items-center">
        <span className="font-medium text-neutral-900 mr-1">Lagt til:</span>
        <span className="text-neutral-900">{new Date(publishDates[itemDataset]).toLocaleDateString('no')}</span>
      </div>
    )}
    {datasetTypes[itemDataset]?.includes('updated') && (
      <div className="flex items-center">
        <span className="font-medium text-neutral-900 mr-1">Oppdatert:</span>
        <span className="text-neutral-900">{new Date(parseInt(statsItem?.timestamp) * 1000).toLocaleDateString('no')}</span>
      </div>
    )}
    </div>
}
