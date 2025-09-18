import SearchForm from "@/components/search/form/search-form";
import Menu from "../menu";
import SearchTitle from "@/components/layout/search-title";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        <header className="absolute top-0 flex h-14 w-full xl:w-[25svw] flex xl:gap-2 xl:p-2">
            <SearchForm/>
            <SearchTitle/>
        </header>
            {children}
        </>
    )
}