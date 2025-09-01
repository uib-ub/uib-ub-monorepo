import Link from "next/link";
import { PiArchive, PiDatabase } from "react-icons/pi";
import React from "react";

export default function HomeNavCards({iiifStats, datasets }: {datasets: any, iiifStats: any}) {

    const navCards = [
        {
            href: "/info/datasets",
            icon: <PiDatabase aria-hidden="true"/>,
            stat: Object.keys(datasets).length.toLocaleString('nb-NO'),
            title: "Datasett",
            description: "Få oversikt over kjeldene stadnamnsøket er basert på",
        },
        {
            href: "/iiif",
            icon: <PiArchive aria-hidden="true"/>,
            stat: (iiifStats.images + iiifStats.audio).toLocaleString('nb-NO'),
            title: "Arkiv",
            description: "Hierarkisk utforsker for arkivressurser som faksimiler og lydopptak",
        },
    ];

    return (
        <nav className="w-full flex flex-col items-center mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-xl">
                {navCards.map((card, idx) => (
                    <Link
                        key={card.title + idx}
                        href={card.href}
                        className="flex flex-row shadow-md bg-neutral-50/90 rounded-lg p-3 gap-3 no-underline transition-shadow hover:shadow-lg w-full"
                    >
                        <div className="flex flex-col justify-between flex-1 min-w-0 items-center">
                            <div className="flex flex-col items-center">
                                <h2 className="text-2xl text-neutral-800 font-serif font-semibold mb-1 flex items-center gap-2">
                                    {card.title}
                                </h2>
                                {card.description && (
                                    <div className="text-neutral-800 font-normal text-center">
                                        {card.description}
                                    </div>
                                )}
                            </div>
                            <span className="flex flex-row items-center gap-2 text-neutral-900 text-2xl font-bold rounded-full mt-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                                {card.stat}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
}