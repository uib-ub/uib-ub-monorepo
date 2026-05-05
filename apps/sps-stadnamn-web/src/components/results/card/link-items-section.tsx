"use client";

import { datasetTitles } from "@/config/metadata-config";
import SourceLink from "@/components/results/card/source-link";

type LinkItem = {
    uuid?: string;
    links?: string[] | string;
    dataset?: string;
};

export function LinkItemsSection({ linkItems }: { linkItems: LinkItem[] }) {
    if (!Array.isArray(linkItems) || linkItems.length === 0) return null;

    const visibleItems = linkItems
        .map((item) => {
            const rawLinks = item?.links;
            const links =
                Array.isArray(rawLinks)
                    ? rawLinks.filter((link): link is string => typeof link === "string" && link.length > 0)
                    : typeof rawLinks === "string" && rawLinks
                        ? [rawLinks]
                        : [];
            return { ...item, links };
        })
        .filter((item) => item.links.length > 0);

    if (visibleItems.length === 0) return null;

    const showDatasetLabel = visibleItems.length > 1;

    return (
        <div className="px-3 space-y-1">
            {visibleItems.map((item, itemIndex) => {
                const datasetLabel = item.dataset ? (datasetTitles[item.dataset] || item.dataset) : null;
                return (
                    <div key={`${item.uuid || "link-item"}-${itemIndex}`} className="text-sm text-neutral-900">
                        {showDatasetLabel && datasetLabel ? (
                            <>
                                <span className="font-semibold text-neutral-950">{datasetLabel}</span>
                                <span className="text-neutral-500"> | </span>
                            </>
                        ) : null}
                        {item.links.map((link, linkIndex) => (
                            <span key={`${link}-${linkIndex}`}>
                                <SourceLink url={link} />
                                {linkIndex < item.links.length - 1 ? <span className="text-neutral-500"> | </span> : null}
                            </span>
                        ))}
                    </div>
                );
            })}
        </div>
    );
}
