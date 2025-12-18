'use client'
import { GlobalContext } from "@/state/providers/global-provider"
import { useContext, useState } from "react"
import { PiCaretDown, PiCaretRight } from "react-icons/pi"

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
    <div className={className}>
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
      >
        <span className="text-neutral-800">
          {expanded ? <PiCaretDown className="text-xs" /> : <PiCaretRight className="text-xs" />}
        </span>
        <span className="text-neutral-900">{label}</span>
      </button>
      {expanded && definition && (
        <p className="text-sm text-neutral-800 mt-1 ml-4">
          {definition}
        </p>
      )}
    </div>
  )
}

