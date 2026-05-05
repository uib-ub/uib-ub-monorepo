'use client'
import { GlobalContext } from "@/state/providers/global-provider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import { PiArrowLeftBold, PiCaretLeft } from "react-icons/pi";

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
                <Link
                    href={currentUrl.current}
                    className="flex items-center gap-2 no-underline xl:py-1 xl:pl-2 xl:pr-4 xl:gap-1 flex ml-auto xl:ml-4 btn btn-outline rounded-md items-center justify-center mr-2 gap-2 no-underline text-neutral-900"
                >
                    <PiArrowLeftBold className="text-2xl xl:text-base" />
                    <span className="sr-only xl:not-sr-only text-base">Stadnamnsøk</span>
                </Link>
        );
    }
    return null;
}