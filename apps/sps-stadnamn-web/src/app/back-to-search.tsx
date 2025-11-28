'use client'
import { GlobalContext } from "@/state/providers/global-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { PiCaretLeft } from "react-icons/pi";

export default function BackToSearch() {
    const { currentUrl } = useContext(GlobalContext);
    const pathname = usePathname();

    if (
        pathname !== "/" &&
        pathname !== "/search" &&
        currentUrl &&
        currentUrl.current
    ) {
        return (
            <div className="flex items-center justify-center py-4 ml-4 border-b border-neutral-200 gap-2 no-underline text-xl ">
                <Link
                    href={currentUrl.current}
                    className="flex items-center gap-2 no-underline text-xl"
                >
                    <PiCaretLeft className="text-2xl" />
                    Tilbake
                </Link>
            </div>
        );
    }
    return null;
}