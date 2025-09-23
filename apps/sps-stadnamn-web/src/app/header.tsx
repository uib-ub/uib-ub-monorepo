import Link from "next/link";
import Menu from "./menu";


export default function Header() {

    return (
        <header className="sticky shadow-lg top-0 left-0 bg-neutral-50 w-full flex h-14 flex-none items-center overscroll-none z-[6000]">
        <Menu/>
        <Link href="/" className="text-xl no-underline px-4">stadnamn.no</Link>
        </header>
    )
}