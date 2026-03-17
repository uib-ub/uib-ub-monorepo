
import SearchForm from "@/components/form/search-form";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SearchForm />
            {children}
        </>
    )
}