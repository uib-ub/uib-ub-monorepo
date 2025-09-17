import Link from "next/link";
import Menu from "./menu";


export default function Header() {

    return (
        <header className={`sticky bg-neutral-50 flex h-14 flex-none gap-2 items-center overscroll-none z-[6000]`}>
            <Menu/><Link href="/" className="text-xl no-underline">stadnamn.no</Link>

        </header>
    )
}