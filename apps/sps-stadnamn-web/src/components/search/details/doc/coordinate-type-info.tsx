'use client'
import ClickableIcon from "@/components/ui/clickable/clickable-icon"
import IconButton from "@/components/ui/icon-button"
import { GlobalContext } from "@/state/providers/global-provider"
import { useContext, useState } from "react"
import { PiCaretDown, PiCaretRight, PiX } from "react-icons/pi"

interface CoordinateTypeInfoProps {
  coordinateType: string
  className?: string
}

export default function CoordinateTypeInfo({ coordinateType, className = '' }: CoordinateTypeInfoProps) {
  const { coordinateVocab } = useContext(GlobalContext)
  const [expanded, setExpanded] = useState(false)
  
  const typeData = coordinateVocab?.[coordinateType]
  const label = typeData?.label || coordinateType
  const definition = typeData?.definition
  
  if (!coordinateType) return null
  
  return (
    <div className={`min-w-0 w-full`}>
      <span className="flex"><button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-1 text-left text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
      >
        <span className="text-neutral-800 shrink-0">
          {expanded ? <PiCaretDown className="text-xs" /> : <PiCaretRight className="text-xs" />}
        </span>
        <span className="text-neutral-900 min-w-0 truncate">{label}</span>
      </button>
      </span>
      {expanded && definition && (
        <p className="mt-1 ml-4 min-w-0 break-words text-sm text-neutral-800">
          {definition}
        </p>
      )}
    </div>
  )
}

