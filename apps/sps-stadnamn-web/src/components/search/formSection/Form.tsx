'use client'
import { usePathname, useRouter } from 'next/navigation';
import { PiMagnifyingGlass } from 'react-icons/pi';

export default function Form({children, ...rest}: {children: React.ReactNode, [x: string]: any}) {
    const router = useRouter()
    
    
    const handleSubmit = async (event: any) => {
        event.preventDefault()
        const q = event.target.q.value
        router.push(`/search?q=${q}`)
    }

    return <form id="search-form" action="/search" onSubmit={handleSubmit} {...rest}>
            {children}
          </form>
    
          



}