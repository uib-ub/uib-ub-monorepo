import Clickable from "@/components/ui/clickable/clickable";
import useDocData from "@/state/hooks/doc-data";
import useGroupData from "@/state/hooks/group-data";
import { useSearchParams } from "next/navigation";
import { PiBookOpenFill, PiBookOpenLight, PiCardsFill, PiCardsLight, PiCaretLeftBold, PiListBullets, PiListBulletsLight, PiListLight } from "react-icons/pi";


export default function DetailsTabs() {
  const searchParams = useSearchParams()
  const details = searchParams.get('details') || 'doc'
  const { groupData, groupTotal, groupStatus, groupLoading } = useGroupData()
  const { docData } = useDocData()
  return <>

    {(groupTotal?.value == 1 || groupLoading || groupData?.[0]?._source?.group.id == docData?._source?.group?.id || true) ? <>


      <Clickable
        add={{ details: "doc" }}
        aria-selected={details == "doc" || (details == "group" && !groupData)}
        className="flex h-10 whitespace-nowrap items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3 text-neutral-900 aria-selected:bg-neutral-100 aria-selected:shadow-inner">
        {details == "doc" ? <PiCardsFill className="text-accent-800" aria-hidden="true" /> : <PiCardsLight className="text-accent-900" aria-hidden="true" />}
        <span className="text-neutral-900 sr-only 2xl:not-sr-only whitespace-nowrap">Paginering</span>
      </Clickable>

      {(groupTotal?.value && groupTotal.value > 1 || groupStatus != 'success' || true) && <Clickable
        remove={["details", "namesNav"]}
        add={{ details: "group" }}
        aria-selected={details == "group"}
        className="flex whitespace-nowrap group relative items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 px-3 aria-selected:bg-neutral-100 aria-selected:text-neutral-900 aria-selected:shadow-inner">
        {details == "group" ? <PiCardsFill className="text-accent-800" aria-hidden="true" /> : <PiCardsLight className="text-accent-900" aria-hidden="true" />}
        <span className="text-neutral-900 hidden xl:flex flex-nowrap whitespace-nowrap">Oversikt</span>

      </Clickable>}
    </>
      :
      <Clickable className="flex h-10 whitespace-nowrap items-center basis-1 gap-2 no-underline w-full lg:w-auto p-1 pr-4 pl-3 text-neutral-900 aria-selected:bg-neutral-100 aria-selected:shadow-inner"
        add={{ doc: groupData?.[0]?._source?.uuid }}>
        <PiCaretLeftBold className="text-primary-600" aria-hidden="true" /> Tilbake til gruppe
      </Clickable>
    }
  </>

}