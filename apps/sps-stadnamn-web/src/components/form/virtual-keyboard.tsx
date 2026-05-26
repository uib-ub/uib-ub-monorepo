'use client'
import { useEffect, useRef, useState } from 'react'
import { PiKeyboard } from 'react-icons/pi'

const CHAR_GROUPS = [
    [['Æ', 'æ', 'Ø', 'ø', 'Å', 'å']],
    [['Á', 'á', 'Ŋ', 'ŋ', 'Đ', 'đ', 'Ŧ', 'ŧ'], ['Ž', 'ž']],
    [['Þ', 'þ', 'ð']],
    [['Ä', 'ä', 'Ö', 'ö']],
]

interface Props {
    inputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
    onOpenChange?: (open: boolean) => void
}

export default function VirtualKeyboard({ inputRef, onOpenChange }: Props) {
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

    return (
        <div className="relative flex items-center">
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
                    aria-label="Spesialtegn"
                    className="absolute top-full right-0 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg p-2 z-[7500]"
                    style={{ minWidth: 'max-content' }}
                >
                    <div className="flex flex-col gap-2">
                        {CHAR_GROUPS.map((group, gi) => (
                            <div key={gi} className={`flex flex-col gap-1 ${gi > 0 ? 'border-t border-neutral-100 pt-2' : ''}`}>
                                {group.map((row, ri) => (
                                    <div key={ri} className="flex gap-1">
                                        {row.map((char) => (
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
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
