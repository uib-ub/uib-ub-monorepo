import { datasetPresentation, datasetTitles } from "@/config/metadata-config";
import { treeSettings } from "@/config/server-config";
import { useMode } from '@/lib/param-hooks';
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactElement } from "react";
import { PiCaretRight, PiMagnifyingGlass, PiTreeView, PiWall } from "react-icons/pi";

const icons: { [key: string]: ReactElement } = {
    "base": <PiWall className="text-neutral-800" aria-hidden="true" />,
};

export default function DatasetToolbar({ itemDataset }: { itemDataset: string }) {
    const mode = useMode()
    const pathname = usePathname()

    return <nav className="flex flex-wrap gap-2">
        <Link aria-current={(pathname == '/search' && mode == 'map') ? 'page' : false}
            href={`/search?dataset=${itemDataset}`}
            className="btn btn-outline btn-compact">
            <PiMagnifyingGlass aria-hidden="true" /> Søk
        </Link>
        {Object.entries(datasetPresentation[itemDataset]?.subindices || {}).map(([key, value]) => (
            <Link key={key} href={`/search?dataset=${key}&mode=list`}
                className="btn btn-outline btn-compact">
                {icons[value.icon]} {datasetTitles[key][0].toUpperCase() + datasetTitles[key].slice(1)}
            </Link>
        ))}

        {treeSettings[itemDataset] && <Link href={`/search?dataset=${itemDataset}&nav=tree`} className="btn btn-outline btn-compact"><PiTreeView className="text-neutral-800" aria-hidden="true" />Register</Link>}

        <Link href={`/info/datasets/${itemDataset}`} className="btn btn-outline btn-compact">Les meir<PiCaretRight className="text-primary-700" aria-hidden="true" /></Link>

    </nav>

}


