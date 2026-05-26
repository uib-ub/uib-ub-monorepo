'use client'
import { GlobalContext } from '@/state/providers/global-provider'
import { useContext, useEffect, useRef, useState } from 'react'
import { PiKeyboard, PiX } from 'react-icons/pi'

// Sami first (Sami alphabet order), then Norwegian, then other Nordic
const CHARS = ['Á','á','Đ','đ','Ŋ','ŋ','Ŧ','ŧ','Ž','ž','Æ','æ','Ø','ø','Å','å','Ä','ä','Ö','ö','Þ','þ','ð']

interface Props {
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
    onOpenChange?: (open: boolean) => void
    searchBar?: boolean
}

export default function VirtualKeyboard({ inputRef, onOpenChange, searchBar }: Props) {
    const { isMobile } = useContext(GlobalContext)
    const [open, setOpen] = useState(false)
    const panelRef = useRef<HTMLDivElement>(null)
    const triggerRef = useRef<HTMLButtonElement>(null)

    const toggle = (next: boolean) => {
        setOpen(next)
        onOpenChange?.(next)
    }

    useEffect(() => {
        if (!open) return
        const handlePointerDown = (e: PointerEvent) => {
            if (
                panelRef.current?.contains(e.target as Node) ||
                triggerRef.current?.contains(e.target as Node)
            ) return
            toggle(false)
        }
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                toggle(false)
                triggerRef.current?.focus()
            }
        }
        document.addEventListener('pointerdown', handlePointerDown)
        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown)
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [open])

    const insertChar = (char: string) => {
        const el = inputRef.current
        if (!el) return
        const start = el.selectionStart ?? el.value.length
        const end = el.selectionEnd ?? el.value.length
        const newValue = el.value.slice(0, start) + char + el.value.slice(end)
        const proto = el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype
        const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set
        nativeSetter?.call(el, newValue)
        el.dispatchEvent(new Event('input', { bubbles: true }))
        toggle(false)
        el.focus()
        el.setSelectionRange(start + char.length, start + char.length)
    }

    const panelClass = searchBar
        ? isMobile
            ? 'top-[3.5rem] left-0 w-full'
            : 'top-[3rem] -left-12 w-[calc(100%+3rem)] lg:w-[calc(30svw-1rem)] xl:w-[calc(25svw-1rem)]'
        : 'left-0 top-full mt-1'

    return (
        <div className="flex items-center">
            <button
                ref={triggerRef}
                type="button"
                aria-label="Virtuelt tastatur for spesialtegn"
                aria-expanded={open}
                aria-haspopup="dialog"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggle(!open)}
                className="p-1 text-neutral-500 hover:text-neutral-800 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
            >
                <PiKeyboard className="text-3xl lg:text-2xl" aria-hidden="true" />
            </button>

            {open && (
                <div
                    ref={panelRef}
                    role="dialog"
                    aria-label="Spesialteikn"
                    className={`absolute ${panelClass} bg-white border border-neutral-200 rounded-md shadow-lg p-2 z-[7500]`}
                >
                    <button
                        type="button"
                        aria-label="Lukk tastatur"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => toggle(false)}
                        className="absolute top-1 right-1 p-0.5 text-neutral-400 hover:text-neutral-700 rounded"
                    >
                        <PiX className="text-sm" aria-hidden="true" />
                    </button>
                    <div className="flex flex-wrap gap-1 pr-6">
                        {CHARS.map((char) => (
                            <button
                                key={char}
                                type="button"
                                aria-label={`Set inn ${char}`}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => insertChar(char)}
                                className="w-8 h-8 border border-neutral-200 rounded text-sm hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
                            >
                                {char}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
