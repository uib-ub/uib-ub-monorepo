"use client"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { PiMagnifyingGlass } from "react-icons/pi"

export default function DefinitionBrowser() {

    const pathname = usePathname()
    const [searchTerm, setSearchTerm] = useState("")
    const [definitions, setDefinitions] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [size, setSize] = useState(12)  // Initial number of results to show
    const vocabPage = pathname.split('/').pop()
    const vocab = vocabPage == "definitions" ? "*" : vocabPage

    

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value)
        setSize(12) // Reset size when search term changes
    }

    const handleShowMore = () => {
        setSize(prevSize => prevSize + 48) // Increase size by 12 when clicking "Show More"
    }

    useEffect(() => {
        setIsLoading(true)
        fetch(`/api/definitions?q=${searchTerm}&vocab=${vocab}&size=${size}`, {cache: 'force-cache', next: {tags: ['all']}})
        .then(response => {
            if (!response.ok) {
                throw response
            }
            return response.json()})
        .then(data => setDefinitions(data.hits.hits))
        .catch(error => setError(error))
        .finally(() => setIsLoading(false))
    }, [searchTerm, vocab, size])

    return (
        <nav aria-labelledby="search" className="flex flex-col gap-2">
            <h2 id="search" className="text-lg !my-0">Finn ordforklaringar</h2>
            <div className="flex flex-col gap-2">
                <div className='flex max-w-xl border-none outline outline-1 outline-neutral-300 focus-within:border-neutral-200 rounded-md items-center relative group focus-within:outline-2 focus-within:outline-neutral-600'>
                    <PiMagnifyingGlass className="text-xl shrink-0 text-neutral-600 group-focus-within:text-neutral-800 ml-3" aria-hidden="true"/>
                    
                    <input
                        aria-labelledby="search"
                        className='bg-transparent px-3 py-2 focus:outline-none w-full text-base'
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>
            <ul className="flex flex-wrap gap-2 list-none !px-0">
                {definitions.map((definition: any) => {
                    const subset = definition._index.split('-')[2].split('_')[1]
                    const href = subset == "sosi" ? `/info/definitions/sosi/${definition._source.sosiCode}` : `/info/definitions/${subset}/${definition._source.uuid}`
                    return (
                    <li key={definition._id} className="flex flex-col gap-1 p-2 border border-neutral-200 rounded-md w-72">
                        <Link className="no-underline block" href={href}>
                            <strong className="block overflow-hidden text-ellipsis whitespace-nowrap">{definition._source.label}</strong> 
                            <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm text-neutral-700 m-0">{definition._source.definition}</p>
                        </Link>
                    </li>
                )})}
            </ul>
            {definitions.length >= size && (
                <button
                    onClick={handleShowMore}
                    className="mt-4 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md self-center"
                    disabled={isLoading}
                >
                    {isLoading ? 'Lastar...' : 'Vis fleire'}
                </button>
            )}
        </nav>
    )
}