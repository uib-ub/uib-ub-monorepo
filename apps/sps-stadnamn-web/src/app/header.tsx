import Link from "next/link";
import BackToSearch from "./back-to-search";
import Menu from "./menu";


export default function Header({ name, route }: { name?: string, route?: string }) {

    return (
        <header className="shadow-lg top-0 left-0 bg-neutral-50 w-full flex h-14 flex-none items-center overscroll-none">
            <Menu />
            <Link href="/" className="text-xl no-underline">stadnamn.no</Link>
            {name && (
                <>
                    <div className="mx-4 h-6 w-px bg-black"></div>
                    {route ? <Link href={route} className="text-lg truncate no-underline">{name}</Link> : <span className="text-lg truncate">{name}</span>}
                </>
            )}
            <BackToSearch />

        </header>
    )
}