'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon";
import { GlobalContext } from "@/state/providers/global-provider";
import { useSubpostNavigation } from "./use-subpost-navigation";
import { useContext } from "react";
import { PiCaretLeftBold, PiCaretRightBold, PiXBold } from "react-icons/pi";

export default function ResultsListNavigator({
  className,
}: {
  className?: string
}) {
  const { isMobile } = useContext(GlobalContext);
  const { isSubpostNavigation, currentId, items, currentIndex, prevId, nextId, prevPoint, nextPoint, isFetching } = useSubpostNavigation()

  if (!isSubpostNavigation) return null
  if (!currentId) return null
  if (items.length <= 1) return null
  const hasCurrent = currentIndex !== -1

  return (
    <nav aria-label="Naviger i resultat" className={`relative w-full bg-neutral-50 rounded-t-md flex items-center p-2 ${className ?? ""}`}>
      <ClickableIcon
        label="Førre"
        add={{ init: prevId, point: prevPoint }}
        remove={["activePoint", "activeYear", "activeName"]}
        notClickable={!prevId || isFetching}
        className="btn btn-outline btn-compact rounded-full w-9 h-9 flex items-center justify-center border-neutral-200 bg-white"
      >
        <PiCaretLeftBold aria-hidden="true" className="text-base" />
      </ClickableIcon>

      <span className="text-sm xl:text-base text-neutral-900 font-sans font-semibold tabular-nums whitespace-nowrap min-w-[4.5rem] text-center">
        {isFetching
          ? `… / ${items.length}`
          : hasCurrent
            ? `${currentIndex + 1} / ${items.length}`
            : `– / ${items.length}`}
      </span>

      <ClickableIcon
        label="Neste"
        add={{ init: nextId, point: nextPoint }}
        remove={["activePoint", "activeYear", "activeName"]}
        notClickable={!nextId || isFetching}
        className="btn btn-outline btn-compact rounded-full w-9 h-9 flex items-center justify-center border-neutral-200 bg-white"
      >
        <PiCaretRightBold aria-hidden="true" className="text-base" />
      </ClickableIcon>

      <div className={`absolute inset-y-0 ${isMobile ? "right-3" : "right-2"} flex items-center`}>
        <ClickableIcon
          label="Lukk navigering"
          remove={["activePoint", "activeYear", "activeName", "init", "resultLimit"]}
          className="btn btn-outline rounded-full text-neutral-900 p-2"
        >
          <PiXBold aria-hidden="true" className="text-lg text-neutral-800" />
        </ClickableIcon>
      </div>
    </nav>
  );
}

