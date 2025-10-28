'use client'
import Link from "next/link";
import { useContext } from "react";
import { GlobalContext } from "@/state/providers/global-provider";
import { PiCaretLeft } from "react-icons/pi";
import { usePathname } from "next/navigation";

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