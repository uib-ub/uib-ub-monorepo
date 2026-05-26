'use client'
import { useRef } from 'react'
import Form from 'next/form'
import { PiMagnifyingGlass } from 'react-icons/pi'
import VirtualKeyboard from '@/components/form/virtual-keyboard'

export default function HomeSearchInput() {
    const inputRef = useRef<HTMLInputElement>(null)

    return (
        <Form suppressHydrationWarning={true} id="search-form" className="flex items-center justify-center gap-2 w-full" action="search">
            <label htmlFor="search_input" className="sr-only">Søk i alle stedsnavn</label>
            <div className="relative flex flex-1 items-center bg-white rounded-lg border border-gray-300 h-14 lg:h-12 focus-within:ring-2 focus-within:ring-red-600 focus-within:border-transparent transition-all pr-1">
                <input
                    suppressHydrationWarning={true}
                    ref={inputRef}
                    id="search_input"
                    className="flex-1 bg-transparent text-lg lg:text-base px-4 focus:outline-none h-full"
                    name="q"
                    type="text"
                />
                <VirtualKeyboard inputRef={inputRef} />
            </div>
            <button
                className="bg-red-700 hover:bg-red-800 text-white rounded-lg h-14 lg:h-12 w-14 lg:w-12 flex items-center justify-center transition-colors duration-200 flex-shrink-0"
                type="submit"
                aria-label="Søk"
            >
                <PiMagnifyingGlass className="text-3xl lg:text-2xl" aria-hidden="true" />
            </button>
        </Form>
    )
}
