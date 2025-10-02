import ClientThumbnail from "@/components/doc/client-thumbnail"
import { RoundButton, RoundIconButton } from "@/components/ui/clickable/round-icon-button"
import { useState } from "react"
import { PiCaretLeft, PiCaretRight } from "react-icons/pi"

type CarouselItem = { dataset: string, uuid: string, iiif?: string, html?: string, text?: string }

export default function Carousel({ items }: { items: CarouselItem[] }) {
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    if (!items?.length) {
        return null
    }
    return <div className="flex flex-row h-64 relative">
        
        
            <div key={items[currentIndex].uuid} className="w-full h-full bg-neutral-100 border-y border-neutral-300 flex flex-col">
                <div className="overflow-hidden h-full">
                
                {items[currentIndex].iiif && <ClientThumbnail iiif={items[currentIndex].iiif}/>}
                {items[currentIndex].content?.html && <div className="p-2 bg-neutral-50 h-full text-black" dangerouslySetInnerHTML={{ __html: items[currentIndex].content.html }} />}
                </div>
                <div className="flex flex-row gap-2 p-1 items-center border-t border-neutral-300">
                {currentIndex > 0 && <RoundIconButton label="Forrige" className="size-8 flex items-center justify-center" onClick={() => setCurrentIndex(currentIndex - 1)}><PiCaretLeft className="text-sm"/></RoundIconButton>}
                Description
                
                {currentIndex < items.length - 1 && <RoundIconButton label="Neste" className="size-8 flex items-center justify-center ml-auto" onClick={() => setCurrentIndex(currentIndex + 1)}><PiCaretRight className="text-sm"/></RoundIconButton>}
                </div>
                
            </div>

    </div>
}