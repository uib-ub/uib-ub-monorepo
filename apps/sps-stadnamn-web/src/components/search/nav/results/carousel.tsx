import ClientThumbnail from "@/components/doc/client-thumbnail"
import { RoundButton, RoundIconButton } from "@/components/ui/clickable/round-icon-button"
import { useState } from "react"
import { PiCaretLeft, PiCaretRight } from "react-icons/pi"

type CarouselItem = { dataset: string, uuid: string, iiif?: string, content?: { text?: string, html?: string } }

export default function Carousel({ items }: { items: CarouselItem[] }) {
    const [currentIndex, setCurrentIndex] = useState<number>(0)
    if (!items?.length) {
        return null
    }
    return <div className="flex flex-row h-64 relative">
        
        
            <div key={items[currentIndex].uuid} className="w-full h-full bg-neutral-50 border-y border-neutral-300 flex flex-col">
                <div className="overflow-hidden h-full">
                
                {items[currentIndex].iiif && <ClientThumbnail iiif={items[currentIndex].iiif}/>}
                {items[currentIndex].content?.html && <div className="p-2 h-full text-black relative">
                    <div dangerouslySetInnerHTML={{ __html: items[currentIndex].content.html }} />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none" />
                </div>}
                {items[currentIndex].content?.text && <div className="p-2 h-full text-black relative">
                    <div dangerouslySetInnerHTML={{ __html: items[currentIndex].content.text }} />
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none" />
                </div>}
                
                </div>
                <div className="flex flex-row gap-2 p-1 items-center border-t border-neutral-300">
                {currentIndex > 0 && <RoundIconButton label="Forrige" className="size-8 flex items-center justify-center" onClick={() => setCurrentIndex(currentIndex - 1)}><PiCaretLeft className="text-sm"/></RoundIconButton>}
                Description
                
                {currentIndex < items.length - 1 && <RoundIconButton label="Neste" className="size-8 flex items-center justify-center ml-auto" onClick={() => setCurrentIndex(currentIndex + 1)}><PiCaretRight className="text-sm"/></RoundIconButton>}
                </div>
                
            </div>

    </div>
}