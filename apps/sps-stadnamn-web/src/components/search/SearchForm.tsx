'use client'
import { useRouter } from 'next/navigation';

export default function SearchForm() {
    const router = useRouter()
    
    const handleSubmit = async (event: any) => {
        event.preventDefault()
        const q = event.target.q.value
        router.push(`/view/search?q=${q}`)
    }


    return (
        <form onSubmit={handleSubmit}>
            <input type="text" name="q"/>
            <button type="submit">Søk</button>
        </form>
    )

}