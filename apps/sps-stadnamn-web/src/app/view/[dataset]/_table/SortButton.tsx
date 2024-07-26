import { useSearchParams, useParams, useRouter } from "next/navigation"
import { PiSortAscending, PiSortDescending } from "react-icons/pi"


export default function SortButton({ children, field }: { children: React.ReactNode, field: string }) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const params = useParams()

    const sortToggle = (field: string) => {
        const newParams = new URLSearchParams(searchParams)

        newParams.delete('page')
        
        if (newParams.get('asc') == field) {
            newParams.delete('asc')
            newParams.set('desc', field)
        }
        else if (newParams.get('desc') == field) {
            newParams.delete('desc')
        }
        else if (newParams.get('asc') != field) {
            newParams.delete('asc')
            newParams.delete('desc')
            newParams.set('asc', field)
        }
        



        router.push(`/view/${params.dataset}?${newParams.toString()}`)
    }

    return (
        <button onClick={() => sortToggle(field)}>
                            {children}
                            {
                                searchParams.get('asc') == field && <PiSortAscending className='text-xl inline ml-2'/>
                            }
                            {
                                searchParams.get('desc') == field && <PiSortDescending className='text-xl inline ml-2'/>
                            }
        </button>
    )
}