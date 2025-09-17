import SearchForm from "@/components/search/form/search-form";
import Menu from "../menu";
import SearchTitle from "@/components/layout/search-title";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        <header className="absolute top-0 flex h-14 w-full xl:w-[25svw]">
            <Menu shadow/>
            <SearchForm/>
            <SearchTitle/>
        </header>
            {children}
        </>
    )
}