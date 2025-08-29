"use client"
import Link from "next/link";
import { PiArchive, PiDatabase } from "react-icons/pi";
import React from "react";
import useStatsData from "@/state/hooks/stats-data";

export default function HomeNavCards() {
    const { statsData, iiifStats, statsLoading } = useStatsData();

    const skeleton = () => (
        <span className="inline-block bg-neutral-900/10 rounded-lg animate-pulse text-transparent w-16 h-7" />
    );

    const navCards = [
        {
            href: "/info/datasets",
            icon: <PiDatabase aria-hidden="true"/>,
            stat: statsLoading
                ? skeleton()
                : statsData?.datasets
                    ? Object.keys(statsData.datasets).length.toLocaleString('nb-NO')
                    : "",
            title: "Datasett",
            description: "Få oversikt over kjeldegrunnlaget i Stadnamnportalen",
        },
        {
            href: "/iiif",
            icon: <PiArchive aria-hidden="true"/>,
            stat: statsLoading
                ? skeleton()
                : iiifStats
                    ? (iiifStats.images + iiifStats.audio).toLocaleString('nb-NO')
                    : "",
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
                        className="flex flex-row shadow-md bg-white opacity-90 rounded-lg p-3 gap-3 no-underline transition hover:shadow-lg max-w-md w-full mx-auto"
                    >
                        <div className="flex flex-col justify-between flex-1 min-w-0 items-center">
                            <div className="flex flex-col items-center">
                                <h2 className="text-2xl text-neutral-800 font-serif mb-1 flex items-center gap-2">
                                    {card.title}
                                </h2>
                                {card.description && (
                                    <div className="text-neutral-800 font-normal text-center">
                                        {card.description}
                                    </div>
                                )}
                            </div>
                            <span className="flex flex-row items-center gap-2 text-neutral-900 text-2xl font-serif rounded-full mt-2" style={{ fontVariantNumeric: "tabular-nums" }}>
                                {card.stat}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </nav>
    );
}