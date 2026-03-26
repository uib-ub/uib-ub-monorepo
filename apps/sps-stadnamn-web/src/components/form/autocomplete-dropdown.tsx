'use client'

import AdmInfo from '@/components/shared/adm-info';
import { useGroupParam, useMode } from '@/lib/param-hooks';
import { useSearchQuery } from '@/lib/search-params';
import useAutocompleteData, {
    getAutocompleteSelection,
} from '@/state/hooks/autocomplete-data';
import useResultCardData from '@/state/hooks/result-card-data';
import { GlobalContext } from '@/state/providers/global-provider';
import { useSessionStore } from '@/state/zustand/session-store';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { PiMagnifyingGlass, PiMapPinFill, PiWall } from 'react-icons/pi';

export type AutocompleteSelection = {
    inputString: string;
    /** When set, submit this as `q` without changing the input value. */
    submitQ?: string;
    group: string | null;
    coordinates?: [number, number];
    clearGroup?: boolean;
    /** When set, overrides the current `fulltext` URL param for this submit. */
    forceFulltext?: boolean;
};

function escapeRegExp(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function uniqueLimit<T>(items: T[], keyFn: (item: T) => string, limit: number): T[] {
    const out: T[] = [];
    const seen = new Set<string>();
    for (const item of items) {
        const key = keyFn(item);
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(item);
        if (out.length >= limit) break;
    }
    return out;
}

function normalizeWords(s: string): string[] {
    return (s || '')
        .trim()
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter(Boolean);
}

function computeWordStartHighlights(
    query: string,
    candidate: string,
): Array<{ start: number; end: number }> {
    const qWords = normalizeWords(query);
    if (!qWords.length) return [];

    const lower = candidate.toLowerCase();
    const wordStartRe = /(^|[^\p{L}\p{N}]+)([\p{L}\p{N}]+)/gu;
    const wordStarts: Array<{ start: number; word: string }> = [];

    for (const m of lower.matchAll(wordStartRe)) {
        const full = m[0] || '';
        const prefix = m[1] || '';
        const token = m[2] || '';
        const start = (m.index ?? 0) + (full.length - token.length);
        if (token) wordStarts.push({ start, word: token });
        // `prefix` is only here to define word boundaries.
        void prefix;
    }

    const ranges: Array<{ start: number; end: number }> = [];
    let cIndex = 0;
    for (const q of qWords) {
        let found = false;
        for (; cIndex < wordStarts.length; cIndex++) {
            const w = wordStarts[cIndex];
            if (w.word.startsWith(q)) {
                ranges.push({ start: w.start, end: w.start + q.length });
                found = true;
                cIndex += 1;
                break;
            }
        }
        if (!found) return [];
    }

    return ranges;
}

function computeAnyTokenWordStartHighlights(
    query: string,
    candidate: string,
): Array<{ start: number; end: number }> {
    const qWords = normalizeWords(query);
    if (!qWords.length) return [];

    const lower = candidate.toLowerCase();
    const wordStartRe = /(^|[^\p{L}\p{N}]+)([\p{L}\p{N}]+)/gu;

    const ranges: Array<{ start: number; end: number }> = [];
    for (const m of lower.matchAll(wordStartRe)) {
        const full = m[0] || '';
        const token = m[2] || '';
        if (!token) continue;
        const start = (m.index ?? 0) + (full.length - token.length);

        let bestLen = 0;
        for (const q of qWords) {
            if (token.startsWith(q) && q.length > bestLen) bestLen = q.length;
        }
        if (bestLen > 0) {
            ranges.push({ start, end: start + bestLen });
        }
    }
    return ranges;
}

function computeAnyTokenSubstringHighlights(
    query: string,
    candidate: string,
): Array<{ start: number; end: number }> {
    const qWords = normalizeWords(query);
    if (!qWords.length) return [];

    const lower = candidate.toLowerCase();
    const wordRe = /(^|[^\p{L}\p{N}]+)([\p{L}\p{N}]+)/gu;
    const ranges: Array<{ start: number; end: number }> = [];

    for (const m of lower.matchAll(wordRe)) {
        const full = m[0] || '';
        const token = m[2] || '';
        if (!token) continue;
        const wordStart = (m.index ?? 0) + (full.length - token.length);

        let best: { idx: number; len: number } | null = null;
        for (const q of qWords) {
            if (!q) continue;
            const idx = token.indexOf(q);
            if (idx < 0) continue;
            if (!best || q.length > best.len) best = { idx, len: q.length };
        }
        if (best) {
            ranges.push({
                start: wordStart + best.idx,
                end: wordStart + best.idx + best.len,
            });
        }
    }

    return ranges;
}

function stripHtmlToText(input: unknown): string {
    if (typeof input !== 'string') return '';
    return input
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function HighlightedLabel({
    label,
    query,
}: {
    label: string;
    query: string;
}) {
    const ranges = useMemo(
        () => {
            const q = query.trim();
            if (q.length <= 1) {
                return computeWordStartHighlights(q, label);
            }
            const full = computeWordStartHighlights(query, label);
            if (full.length) return full;
            const anyStart = computeAnyTokenWordStartHighlights(query, label);
            if (anyStart.length) return anyStart;
            return computeAnyTokenSubstringHighlights(query, label);
        },
        [query, label],
    );

    if (!ranges.length) return <>{label}</>;

    const out: Array<{ text: string; highlight: boolean }> = [];
    let i = 0;
    for (const r of ranges) {
        if (r.start > i) out.push({ text: label.slice(i, r.start), highlight: false });
        out.push({ text: label.slice(r.start, r.end), highlight: true });
        i = r.end;
    }
    if (i < label.length) out.push({ text: label.slice(i), highlight: false });

    return (
        <>
            {out.map((part, idx) =>
                part.highlight ? (
                    <mark
                        // eslint-disable-next-line react/no-array-index-key
                        key={idx}
                        className="bg-accent-100 text-inherit rounded px-0.5"
                    >
                        {part.text}
                    </mark>
                ) : (
                    // eslint-disable-next-line react/no-array-index-key
                    <span key={idx}>{part.text}</span>
                ),
            )}
        </>
    );
}

type AutocompleteDropdownProps = {
    inputState: string;
    onSelect: (selection: AutocompleteSelection) => void;
    inputRef: React.RefObject<HTMLInputElement | null>;
};

export default function AutocompleteDropdown({
    inputState,
    onSelect,
    inputRef,
}: AutocompleteDropdownProps) {
    const { isMobile } = useContext(GlobalContext);
    const { facetFilters, datasetFilters } = useSearchQuery();
    const mode = useMode();
    const isTableMode = mode === 'table';
    const group = useGroupParam();
    const autocompleteOpen = useSessionStore((s: any) => s.autocompleteOpen);
    const setAutocompleteOpen = useSessionStore(
        (s: any) => s.setAutocompleteOpen,
    );
    const activeIndex = useSessionStore((s: any) => s.autocompleteActiveIndex);
    const setActiveIndex = useSessionStore(
        (s: any) => s.setAutocompleteActiveIndex,
    );
    const setHasResults = useSessionStore(
        (s: any) => s.setAutocompleteHasResults,
    );
    const { rankedHits } = useAutocompleteData(inputState);
    const { resultCardData } = useResultCardData(undefined, {
        forceGroupLookup: true,
    });

    const groupFulltextCorpus = useMemo(() => {
        if (!group) return '';
        const items = (resultCardData as any)?.textItems;
        if (!Array.isArray(items) || items.length === 0) return '';
        return items
            .map((it: any) => stripHtmlToText(it?.text))
            .filter(Boolean)
            .join(' ');
    }, [group, resultCardData]);

    const groupLabelOptionsRaw = useMemo(() => {
        if (!group) return [];
        const mainLabel = (resultCardData as any)?.label?.toString?.() || '';
        const additional: string[] = Array.isArray((resultCardData as any)?.additionalLabels)
            ? ((resultCardData as any)?.additionalLabels as any[]).filter(Boolean).map(String)
            : [];

        const raw = [
            ...(mainLabel ? [{ value: mainLabel, isMain: true }] : []),
            ...additional.map((v) => ({ value: v, isMain: false })),
        ];

        const seen = new Set<string>();
        return raw
            .map((item) => ({ ...item, value: item.value.trim() }))
            .filter((item) => {
                if (!item.value) return false;
                const key = item.value.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            });
    }, [group, resultCardData]);

    const groupFulltextWordOptions = useMemo(() => {
        if (!group) return [];
        const q = inputState.trim();
        if (!q) return [];
        if (q.length <= 1) return [];

        const tokens = q.split(/\s+/).filter(Boolean);
        const lastToken = (tokens[tokens.length - 1] || '').trim();
        if (!lastToken) return [];

        const labelSet = new Set(
            groupLabelOptionsRaw.map((l) => l.value.toLowerCase()),
        );

        const startRe = new RegExp(
            String.raw`(?:^|[^\p{L}\p{N}])(${escapeRegExp(lastToken)}[\p{L}\p{N}]*)`,
            'giu',
        );

        const found = new Map<string, string>();
        for (const m of groupFulltextCorpus.matchAll(startRe)) {
            const word = (m[1] || '').trim();
            if (!word) continue;
            const key = word.toLowerCase();
            if (labelSet.has(key)) continue; // never show label-exact matches as fulltext
            if (!found.has(key)) found.set(key, word);
            if (found.size >= 20) break;
        }

        // Fallback: if no word-start matches, allow substring-in-word matches.
        if (found.size === 0) {
            const containsRe = new RegExp(
                String.raw`(?:^|[^\p{L}\p{N}])([\p{L}\p{N}]*${escapeRegExp(lastToken)}[\p{L}\p{N}]*)`,
                'giu',
            );
            for (const m of groupFulltextCorpus.matchAll(containsRe)) {
                const word = (m[1] || '').trim();
                if (!word) continue;
                const key = word.toLowerCase();
                if (labelSet.has(key)) continue;
                if (!found.has(key)) found.set(key, word);
                if (found.size >= 20) break;
            }
        }

        return Array.from(found.values()).sort((a, b) => {
            if (a.length !== b.length) return a.length - b.length;
            return a.localeCompare(b, 'nb');
        });
    }, [group, groupFulltextCorpus, groupLabelOptionsRaw, inputState]);

    const groupFulltextPhraseOptions = useMemo(() => {
        if (!group) return [];
        const q = inputState.trim();
        if (!q) return [];
        if (q.length <= 1) return [];

        const tokens = q.split(/\s+/).filter(Boolean);
        if (tokens.length < 2) return [];

        const labelSet = new Set(
            groupLabelOptionsRaw.map((l) => l.value.toLowerCase()),
        );

        // Match "token1... token2... ..." where each token matches word-start of consecutive words.
        // Capture the whole matched phrase (with original casing from corpus).
        const pattern =
            String.raw`(?:^|[^\p{L}\p{N}])(` +
            tokens
                .map((t) => `${escapeRegExp(t)}[\\p{L}\\p{N}]*`)
                .join(String.raw`(?:[^\p{L}\p{N}]+)`) +
            String.raw`)`;

        const re = new RegExp(pattern, 'giu');
        const matches: string[] = [];
        for (const m of groupFulltextCorpus.matchAll(re)) {
            const phrase = (m[1] || '').trim();
            if (!phrase) continue;
            const key = phrase.toLowerCase();
            if (labelSet.has(key)) continue; // never show label-exact matches as fulltext
            matches.push(phrase);
            if (matches.length >= 50) break;
        }

        const unique = uniqueLimit(matches, (s) => s.toLowerCase(), 10);
        return unique.sort((a, b) => {
            if (a.length !== b.length) return a.length - b.length;
            return a.localeCompare(b, 'nb');
        });
    }, [group, groupFulltextCorpus, groupLabelOptionsRaw, inputState]);

    const groupLabelOptions = useMemo(() => {
        if (!group) return [];
        const q = inputState.trim();

        const scored = groupLabelOptionsRaw.map((opt) => {
            const fullRanges = computeWordStartHighlights(q, opt.value);
            const fullMatch = q ? fullRanges.length > 0 : true;
            const tokenRanges = computeAnyTokenWordStartHighlights(q, opt.value);
            const tokenMatch = q ? tokenRanges.length > 0 : true;
            return {
                ...opt,
                __fullMatch: fullMatch,
                __tokenMatch: tokenMatch,
                __len: opt.value.length,
            };
        });

        scored.sort((a, b) => {
            if (a.__fullMatch !== b.__fullMatch) return a.__fullMatch ? -1 : 1;
            if (a.__tokenMatch !== b.__tokenMatch) return a.__tokenMatch ? -1 : 1;
            if (a.__len !== b.__len) return a.__len - b.__len;
            // Tiebreakers: keep deterministic ordering
            if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
            return a.value.localeCompare(b.value, 'nb');
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return scored.map(({ __fullMatch, __tokenMatch, __len, ...rest }) => ({
            ...rest,
            fullMatch: __fullMatch,
            tokenMatch: __tokenMatch,
        }));
    }, [group, groupLabelOptionsRaw, inputState]);

    const groupLabelBuckets = useMemo(() => {
        if (!group) {
            return { full: [], tokenOnly: [], nonMatching: [] };
        }
        const q = inputState.trim();
        if (!q) {
            return { full: groupLabelOptions, tokenOnly: [], nonMatching: [] };
        }
        const full = groupLabelOptions.filter((o: any) => o.fullMatch);
        const tokenOnly = groupLabelOptions.filter(
            (o: any) => !o.fullMatch && o.tokenMatch,
        );
        const nonMatching = groupLabelOptions.filter((o: any) => !o.tokenMatch);
        return { full, tokenOnly, nonMatching };
    }, [group, groupLabelOptions, inputState]);

    const groupSubstringFallback = useMemo(() => {
        if (!group) return false;
        const q = inputState.trim();
        if (!q) return false;
        if (q.length <= 1) return false;
        const hasAnyPrefixMatch =
            groupLabelBuckets.full.length > 0 ||
            groupLabelBuckets.tokenOnly.length > 0 ||
            groupFulltextPhraseOptions.length > 0 ||
            groupFulltextWordOptions.length > 0;
        return !hasAnyPrefixMatch;
    }, [
        group,
        groupLabelBuckets.full.length,
        groupLabelBuckets.tokenOnly.length,
        groupFulltextPhraseOptions.length,
        groupFulltextWordOptions.length,
        inputState,
    ]);

    const groupLabelBucketsEffective = useMemo(() => {
        if (!group || !groupSubstringFallback) return groupLabelBuckets;
        const q = inputState.trim();
        const scored = groupLabelOptionsRaw
            .map((opt) => {
                const sub = computeAnyTokenSubstringHighlights(q, opt.value);
                const subMatch = sub.length > 0;
                return { ...opt, __subMatch: subMatch, __len: opt.value.length };
            })
            .sort((a, b) => {
                if (a.__subMatch !== b.__subMatch) return a.__subMatch ? -1 : 1;
                if (a.__len !== b.__len) return a.__len - b.__len;
                if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
                return a.value.localeCompare(b.value, 'nb');
            });

        const matching = scored.filter((o: any) => o.__subMatch);
        const nonMatching = scored.filter((o: any) => !o.__subMatch);
        return { full: [], tokenOnly: matching, nonMatching };
    }, [
        group,
        groupSubstringFallback,
        groupLabelBuckets,
        groupLabelOptionsRaw,
        inputState,
    ]);

    const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
    const optionsCount = group
        ? groupLabelBucketsEffective.full.length +
          groupFulltextPhraseOptions.length +
          groupLabelBucketsEffective.tokenOnly.length +
          groupFulltextWordOptions.length +
          groupLabelBucketsEffective.nonMatching.length
        : rankedHits.length
            ? 1 + rankedHits.length
            : 0;
    const hasMountedRef = useRef(false);

    // Open/close autocomplete when input value changes and reset active index.
    // Skip the initial run so that a pre-filled `q` from the URL does not
    // automatically open the autocomplete before any user interaction.
    useEffect(() => {
        const trimmed = inputState.trim();

        if (!hasMountedRef.current) {
            hasMountedRef.current = true;
            setAutocompleteOpen(false);
            setActiveIndex(-1);
            return;
        }

        if (!isTableMode && trimmed) {
            setAutocompleteOpen(true);
        } else {
            setAutocompleteOpen(false);
        }
        setActiveIndex(-1);
    }, [inputState, isTableMode, setAutocompleteOpen, setActiveIndex]);

    // Open autocomplete when the user focuses the input and there is text.
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;

        const handleFocus = () => {
            if (!isTableMode && inputState.trim()) {
                setAutocompleteOpen(true);
            }
        };

        el.addEventListener('focus', handleFocus);
        return () => el.removeEventListener('focus', handleFocus);
    }, [inputRef, inputState, isTableMode, setAutocompleteOpen]);

    useEffect(() => {
        if (!autocompleteOpen) return;
        if (activeIndex < 0) return;
        const el = optionRefs.current[activeIndex];
        if (el) {
            el.scrollIntoView({ block: 'nearest' });
        }
    }, [autocompleteOpen, activeIndex]);

    // Close autocomplete when switching to table mode
    useEffect(() => {
        if (isTableMode && autocompleteOpen) {
            setAutocompleteOpen(false);
        }
    }, [isTableMode, autocompleteOpen, setAutocompleteOpen]);

    // Handle back button on mobile - close autocomplete instead of navigating
    useEffect(() => {
        if (!isMobile) return;

        const handlePopState = () => {
            if (autocompleteOpen) {
                setAutocompleteOpen(false);
                if (inputRef.current) {
                    inputRef.current.blur();
                }
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [
        isMobile,
        autocompleteOpen,
        facetFilters,
        datasetFilters,
        setAutocompleteOpen,
        inputRef,
    ]);

    // Add history entry when autocomplete opens on mobile
    useEffect(() => {
        if (!isMobile || !autocompleteOpen) return;
        window.history.pushState({ autocomplete: true }, '', window.location.href);
    }, [isMobile, autocompleteOpen]);

    // Close autocomplete when input loses focus
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;

        const handleBlur = () => {
            setAutocompleteOpen(false);
        };

        el.addEventListener('blur', handleBlur);
        return () => el.removeEventListener('blur', handleBlur);
    }, [inputRef, setAutocompleteOpen]);

    useEffect(() => {
        const hasResults = group ? optionsCount > 0 : !!rankedHits.length;
        setHasResults(hasResults);
    }, [group, optionsCount, rankedHits, setHasResults]);

    // Keyboard interaction hooked onto the input element.
    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                setAutocompleteOpen(false);
                setActiveIndex(-1);
                return;
            }

            if (e.key === 'Enter') {
                if (autocompleteOpen && activeIndex >= 0) {
                    e.preventDefault();
                    if (group) {
                        const matchCount =
                            groupLabelBucketsEffective.full.length +
                            groupFulltextPhraseOptions.length +
                            groupLabelBucketsEffective.tokenOnly.length;
                        const fulltextOffset = matchCount;
                        const nonMatchOffset = matchCount + groupFulltextWordOptions.length;
                        const isFulltextWord =
                            activeIndex >= fulltextOffset &&
                            activeIndex < nonMatchOffset;
                        const isNonMatchingLabel =
                            activeIndex >= nonMatchOffset &&
                            activeIndex <
                                matchCount +
                                    groupFulltextWordOptions.length +
                                    groupLabelBucketsEffective.nonMatching.length;

                        if (isFulltextWord) {
                            const word =
                                groupFulltextWordOptions[activeIndex - fulltextOffset];
                            if (word) {
                                onSelect({
                                    inputString: word,
                                    group: null,
                                    coordinates: undefined,
                                    forceFulltext: true,
                                });
                            }
                        } else if (isNonMatchingLabel) {
                            const opt =
                                groupLabelBucketsEffective.nonMatching[
                                    activeIndex - nonMatchOffset
                                ];
                            if (opt?.value) {
                                onSelect({
                                    inputString: inputState,
                                    submitQ: opt.value,
                                    group: null,
                                    coordinates: undefined,
                                    forceFulltext: false,
                                });
                            }
                        } else {
                            if (activeIndex < groupLabelBucketsEffective.full.length) {
                                const opt =
                                    groupLabelBucketsEffective.full[activeIndex];
                                if (opt?.value) {
                                    onSelect({
                                        inputString: opt.value,
                                        group: null,
                                        coordinates: undefined,
                                        forceFulltext: false,
                                    });
                                }
                            } else if (
                                activeIndex <
                                groupLabelBucketsEffective.full.length +
                                    groupFulltextPhraseOptions.length
                            ) {
                                const phrase =
                                    groupFulltextPhraseOptions[
                                        activeIndex -
                                            groupLabelBucketsEffective.full.length
                                    ];
                                if (phrase) {
                                    onSelect({
                                        inputString: phrase,
                                        group: null,
                                        coordinates: undefined,
                                        forceFulltext: true,
                                    });
                                }
                            } else {
                                const opt =
                                    groupLabelBucketsEffective.tokenOnly[
                                        activeIndex -
                                            groupLabelBucketsEffective.full.length -
                                            groupFulltextPhraseOptions.length
                                    ];
                                if (opt?.value) {
                                    onSelect({
                                        inputString: opt.value,
                                        group: null,
                                        coordinates: undefined,
                                        forceFulltext: false,
                                    });
                                }
                            }
                        }
                    } else {
                        const selection = getAutocompleteSelection(
                            rankedHits,
                            activeIndex,
                        );
                        if (selection) {
                            onSelect({ ...selection, forceFulltext: false });
                        }
                    }
                    return;
                }
                // Fall through to normal form submit when no active autocomplete option.
                return;
            }

            if (!optionsCount) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!autocompleteOpen && !isTableMode && inputState.trim()) {
                    setAutocompleteOpen(true);
                }
                const current =
                    (useSessionStore.getState() as any)
                        .autocompleteActiveIndex ?? -1;
                const next = (current + 1 + optionsCount) % optionsCount;
                setActiveIndex(next);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!autocompleteOpen && !isTableMode && inputState.trim()) {
                    setAutocompleteOpen(true);
                }
                const current =
                    (useSessionStore.getState() as any)
                        .autocompleteActiveIndex ?? -1;
                const next = (current - 1 + optionsCount) % optionsCount;
                setActiveIndex(next);
            } else {
                // Reset active selection on any character key
                if (e.key.length === 1 || e.key === ' ') setActiveIndex(-1);
            }
        };

        el.addEventListener('keydown', handleKeyDown);
        return () => el.removeEventListener('keydown', handleKeyDown);
    }, [
        inputRef,
        autocompleteOpen,
        isTableMode,
        inputState,
        optionsCount,
        activeIndex,
        rankedHits,
        setAutocompleteOpen,
        setActiveIndex,
        onSelect,
    ]);

    if (!autocompleteOpen || !optionsCount) return null;

    return (
        <ul
            id="autocomplete-results"
            role="listbox"
            className={`absolute ${
                isMobile
                    ? 'top-[3.5rem] left-0 w-full'
                    : 'top-[3rem] -left-12 x-[30svw] lg:w-[calc(25svw-1rem)] shadow-lg rounded-lg rounded-t-none'
            } border-t border-neutral-200 max-h-[calc(100svh-4rem)] min-h-24 bg-neutral-50 overflow-y-auto overscroll-none xl-p-2 xl divide-y divide-neutral-300`}
        >
            {group ? (
                <>
                    {groupLabelBucketsEffective.full.map(
                        (opt: any, index: number) => (
                        <li
                            key={`${opt.isMain ? 'main' : 'alt'}-${opt.value}`}
                            tabIndex={-1}
                            role="option"
                            data-autocomplete-option
                            id={`autocomplete-option-${index}`}
                            ref={(el) => {
                                optionRefs.current[index] = el;
                            }}
                            className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                                activeIndex === index ? 'bg-accent-100' : ''
                            }`}
                            onMouseDown={() => {
                                if (!opt.value) return;
                                onSelect({
                                    inputString: opt.value,
                                    group: null,
                                    coordinates: undefined,
                                    forceFulltext: false,
                                });
                            }}
                            aria-selected={activeIndex === index}
                        >
                            <span className="flex items-center h-6 flex-shrink-0">
                                <PiMagnifyingGlass
                                    className="text-neutral-700"
                                    aria-hidden="true"
                                />
                            </span>
                            <div className="flex-1 leading-6">
                                <div className="inline-flex items-center gap-x-2 w-full">
                                    <strong>
                                        <HighlightedLabel
                                            label={opt.value}
                                            query={inputState}
                                        />
                                    </strong>
                                    <span className="ml-auto flex items-center gap-x-2">
                                        {opt.isMain ? (
                                            <em className="text-neutral-800">
                                                Hovudoppslag
                                            </em>
                                        ) : null}
                                    </span>
                                </div>
                            </div>
                        </li>
                    ),
                    )}
                    {groupFulltextPhraseOptions.map((phrase, i) => {
                        const index = groupLabelBucketsEffective.full.length + i;
                        return (
                            <li
                                key={`fulltext-phrase-${phrase.toLowerCase()}`}
                                tabIndex={-1}
                                role="option"
                                data-autocomplete-option
                                id={`autocomplete-option-${index}`}
                                ref={(el) => {
                                    optionRefs.current[index] = el;
                                }}
                                className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                                    activeIndex === index ? 'bg-accent-100' : ''
                                }`}
                                onMouseDown={() => {
                                    if (!phrase) return;
                                    onSelect({
                                        inputString: phrase,
                                        group: null,
                                        coordinates: undefined,
                                        forceFulltext: true,
                                    });
                                }}
                                aria-selected={activeIndex === index}
                            >
                                <span className="flex items-center h-6 flex-shrink-0">
                                    <PiMagnifyingGlass
                                        className="text-neutral-700"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="flex-1 leading-6">
                                    <div className="inline-flex items-center gap-x-2 w-full">
                                        <strong>
                                            <HighlightedLabel
                                                label={phrase}
                                                query={inputState}
                                            />
                                        </strong>
                                        <em className="text-neutral-700 ml-auto">
                                            fulltekst
                                        </em>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                    {groupLabelBucketsEffective.tokenOnly.map(
                        (opt: any, i: number) => {
                        const index =
                            groupLabelBucketsEffective.full.length +
                            groupFulltextPhraseOptions.length +
                            i;
                        return (
                            <li
                                key={`token-${opt.isMain ? 'main' : 'alt'}-${opt.value}`}
                                tabIndex={-1}
                                role="option"
                                data-autocomplete-option
                                id={`autocomplete-option-${index}`}
                                ref={(el) => {
                                    optionRefs.current[index] = el;
                                }}
                                className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                                    activeIndex === index ? 'bg-accent-100' : ''
                                }`}
                                onMouseDown={() => {
                                    if (!opt.value) return;
                                    onSelect({
                                        inputString: inputState,
                                        submitQ: opt.value,
                                        group: null,
                                        coordinates: undefined,
                                        forceFulltext: false,
                                    });
                                }}
                                aria-selected={activeIndex === index}
                            >
                                <span className="flex items-center h-6 flex-shrink-0">
                                    <PiMagnifyingGlass
                                        className="text-neutral-700"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="flex-1 leading-6">
                                    <div className="inline-flex items-center gap-x-2 w-full">
                                        <strong>
                                            <HighlightedLabel
                                                label={opt.value}
                                                query={inputState}
                                            />
                                        </strong>
                                        {opt.isMain ? (
                                            <em className="text-neutral-800 ml-auto">
                                                Hovudoppslagsord
                                            </em>
                                        ) : null}
                                    </div>
                                </div>
                            </li>
                        );
                    },
                    )}
                    {groupFulltextWordOptions.map((word, wordIndex) => {
                        const index =
                            groupLabelBucketsEffective.full.length +
                            groupFulltextPhraseOptions.length +
                            groupLabelBucketsEffective.tokenOnly.length +
                            wordIndex;
                        return (
                            <li
                                key={`fulltext-word-${word.toLowerCase()}`}
                                tabIndex={-1}
                                role="option"
                                data-autocomplete-option
                                id={`autocomplete-option-${index}`}
                                ref={(el) => {
                                    optionRefs.current[index] = el;
                                }}
                                className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                                    activeIndex === index ? 'bg-accent-100' : ''
                                }`}
                                onMouseDown={() => {
                                    if (!word) return;
                                    onSelect({
                                        inputString: word,
                                        group: null,
                                        coordinates: undefined,
                                        forceFulltext: true,
                                    });
                                }}
                                aria-selected={activeIndex === index}
                            >
                                <span className="flex items-center h-6 flex-shrink-0">
                                    <PiMagnifyingGlass
                                        className="text-neutral-700"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="flex-1 leading-6">
                                    <div className="inline-flex items-center gap-x-2 w-full">
                                        <strong>
                                            <HighlightedLabel
                                                label={word}
                                                query={inputState}
                                            />
                                        </strong>
                                        <em className="text-neutral-700 ml-auto">
                                            Fulltekst
                                        </em>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                    {groupLabelBucketsEffective.nonMatching.map(
                        (opt: any, i: number) => {
                        const index =
                            groupLabelBucketsEffective.full.length +
                            groupFulltextPhraseOptions.length +
                            groupLabelBucketsEffective.tokenOnly.length +
                            groupFulltextWordOptions.length +
                            i;
                        return (
                            <li
                                key={`nonmatch-${opt.value}`}
                                tabIndex={-1}
                                role="option"
                                data-autocomplete-option
                                id={`autocomplete-option-${index}`}
                                ref={(el) => {
                                    optionRefs.current[index] = el;
                                }}
                                className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                                    activeIndex === index ? 'bg-accent-100' : ''
                                }`}
                                onMouseDown={() => {
                                    if (!opt.value) return;
                                    onSelect({
                                        inputString: opt.value,
                                        group: null,
                                        coordinates: undefined,
                                        forceFulltext: false,
                                    });
                                }}
                                aria-selected={activeIndex === index}
                            >
                                <span className="flex items-center h-6 flex-shrink-0">
                                    <PiMagnifyingGlass
                                        className="text-neutral-700"
                                        aria-hidden="true"
                                    />
                                </span>
                                <div className="flex-1 leading-6">
                                    <div className="inline-flex items-center gap-x-2 w-full">
                                        <strong>{opt.value}</strong>
                                        {opt.isMain ? (
                                            <em className="text-neutral-800 ml-auto">
                                                Hovudoppslag
                                            </em>
                                        ) : null}
                                    </div>
                                </div>
                            </li>
                        );
                    },
                    )}
                </>
            ) : (
                <>
                    <li
                        id="autocomplete-option-0"
                        ref={(el) => {
                            optionRefs.current[0] = el;
                        }}
                        className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                            activeIndex === 0 ? 'bg-accent-100' : ''
                        }`}
                        tabIndex={-1}
                        role="option"
                        onMouseDown={() => {
                            const selection = getAutocompleteSelection(
                                rankedHits,
                                0,
                            );
                            if (selection) {
                                onSelect(selection);
                            }
                        }}
                        data-autocomplete-option
                        aria-selected={activeIndex === 0}
                    >
                        <span className="flex items-center h-6 flex-shrink-0">
                            <PiMagnifyingGlass
                                className="text-neutral-700"
                                aria-hidden="true"
                            />
                        </span>
                        <span className="flex-1 leading-6">
                            {rankedHits[0].fields.label[0]}
                        </span>
                    </li>
                    {rankedHits.map((hit: any, index: number) => {
                        const optionIndex = 1 + index;
                        return (
                            <li
                                key={hit._id}
                                tabIndex={-1}
                                role="option"
                                data-autocomplete-option
                                id={`autocomplete-option-${optionIndex}`}
                                ref={(el) => {
                                    optionRefs.current[optionIndex] = el;
                                }}
                                className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                                    activeIndex === optionIndex
                                        ? 'bg-accent-100'
                                        : ''
                                }`}
                                onMouseDown={() => {
                                    const selection =
                                        getAutocompleteSelection(
                                            rankedHits,
                                            optionIndex,
                                        );
                                    if (selection) {
                                        onSelect(selection);
                                    }
                                }}
                                aria-selected={activeIndex === optionIndex}
                            >
                                {hit.fields.location?.length ? (
                                    <span className="flex items-center h-6 flex-shrink-0">
                                        <PiMapPinFill
                                            aria-hidden="true"
                                            className="text-primary-700"
                                        />
                                    </span>
                                ) : null}
                                {hit._index.split('-')[2].endsWith('_g') && (
                                    <span className="flex items-center h-6 flex-shrink-0">
                                        <PiWall aria-hidden="true" />
                                    </span>
                                )}
                                <div className="flex-1 leading-6">
                                    <strong>
                                        {hit.fields.label[0]}{' '}
                                        {hit.fields['group.label'] &&
                                            hit.fields['group.label']?.[0] !=
                                                hit.fields.label[0] &&
                                            `(${hit.fields['group.label']?.[0]})`}{' '}
                                    </strong>{' '}
                                    <span className="text-neutral-900">
                                        <AdmInfo hit={hit} />
                                    </span>
                                </div>
                            </li>
                        );
                    })}
                </>
            )}
        </ul>
    );
}

