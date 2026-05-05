'use client'

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useSourceViewOn } from "@/lib/param-hooks";

const Carousel = dynamic(() => import("@/components/results/carousel"), {
    ssr: false,
    loading: () => (
        <div className="absolute inset-0 rounded-md animate-pulse bg-neutral-900/10" aria-hidden="true" />
    ),
});

type CarouselItem = {
    dataset: string;
    uuid: string;
    iiif?: string | string[];
    content?: { text?: string; html?: string };
};

export default function LazyCarousel({
    items,
    rootMargin = "200px",
}: {
    items: CarouselItem[];
    rootMargin?: string;
}) {
    const sourceViewOn = useSourceViewOn();
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (mounted) return;
        const el = containerRef.current;
        if (!el) return;
        if (typeof IntersectionObserver === "undefined") {
            setMounted(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    setMounted(true);
                    observer.disconnect();
                }
            },
            { root: null, rootMargin, threshold: 0.01 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [mounted, rootMargin]);

    if (!items?.length) return null;

    if (mounted) {
        return <Carousel items={items} />;
    }

    return (
        <div
            ref={containerRef}
            className={`flex flex-row h-28 xl:h-32 2xl:h-48 relative select-none overflow-hidden group w-full bg-neutral-50 p-2 ${
                sourceViewOn ? "mt-4" : ""
            }`}
            aria-hidden="true"
        >
            <div className="absolute inset-0 rounded-md animate-pulse bg-neutral-900/10" />
        </div>
    );
}
