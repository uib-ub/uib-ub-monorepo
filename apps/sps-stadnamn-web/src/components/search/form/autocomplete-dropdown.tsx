'use client'

import AdmInfo from '@/components/search/shared/adm-info';
import { useMode } from '@/lib/param-hooks';
import { useSearchQuery } from '@/lib/search-params';
import useAutocompleteData, {
    getAutocompleteSelection,
} from '@/state/hooks/autocomplete-data';
import { GlobalContext } from '@/state/providers/global-provider';
import { useSessionStore } from '@/state/zustand/session-store';
import { useContext, useEffect, useRef } from 'react';
import { PiMagnifyingGlass, PiMapPinFill, PiWall } from 'react-icons/pi';

export type AutocompleteSelection = {
    inputString: string;
    group: string | null;
    coordinates?: [number, number];
};

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
    const optionRefs = useRef<Array<HTMLLIElement | null>>([]);
    const optionsCount = rankedHits.length ? 1 + rankedHits.length : 0;

    // Open/close autocomplete when input value changes and reset active index.
    useEffect(() => {
        const trimmed = inputState.trim();
        if (!isTableMode && trimmed) {
            setAutocompleteOpen(true);
        } else {
            setAutocompleteOpen(false);
        }
        setActiveIndex(-1);
    }, [inputState, isTableMode, setAutocompleteOpen, setActiveIndex]);

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
        const hasResults = !!rankedHits.length;
        setHasResults(hasResults);
    }, [rankedHits, setHasResults]);

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
                    const selection = getAutocompleteSelection(
                        rankedHits,
                        activeIndex,
                    );
                    if (selection) {
                        onSelect(selection);
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

    if (!autocompleteOpen || !rankedHits.length) return null;

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
            <li
                id="autocomplete-option-0"
                ref={(el) => {
                    optionRefs.current[0] = el;
                }}
                className={`cursor-pointer flex items-start gap-2 min-h-12 py-3 px-2 hover:bg-neutral-100 ${
                    activeIndex === 0 ? 'bg-neutral-100' : ''
                }`}
                tabIndex={-1}
                role="option"
                onMouseDown={() => {
                    const selection = getAutocompleteSelection(rankedHits, 0);
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
                            activeIndex === optionIndex ? 'bg-neutral-100' : ''
                        }`}
                        onMouseDown={() => {
                            const selection = getAutocompleteSelection(
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
        </ul>
    );
}

