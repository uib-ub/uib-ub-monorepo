import SearchForm from "@/components/search/form/search-form";
import Menu from "../menu";
import SearchTitle from "@/components/layout/search-title";

export default function SearchLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
        <SearchForm/>
            {children}
        </>
    )
}