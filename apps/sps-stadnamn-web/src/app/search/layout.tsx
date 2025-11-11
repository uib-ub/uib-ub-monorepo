
import SearchForm from "@/components/search/form/search-form";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        <SearchForm/>
            {children}
        </>
    )
}