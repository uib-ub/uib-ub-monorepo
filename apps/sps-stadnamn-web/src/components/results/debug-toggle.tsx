import { useRouter, useSearchParams } from "next/navigation";

export default function DebugToggle() {
    const router = useRouter()
    const searchParams = useSearchParams()
    return (
        <div className="p-2">
            Vanlige søkeresultater vises ikke i debug-modus
            <button className="btn m-2| btn-outline rounded-full px-2 py-1 pr-3 flex items-center gap-2 text-sm xl:text-base h-7 xl:h-10" onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.delete('debugGroups');
                router.push(`?${newParams.toString()}`)
            }}>Slå av gruppe-debug</button>
        </div>
    )
}