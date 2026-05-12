'use client'
import { baseLayerMaps, overlayLayerMaps } from "@/config/basemap-config";
import { defaultBaseMap } from "@/config/basemap-config";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import ToggleButton from "@/components/ui/toggle-button";
import Clickable from "@/components/ui/clickable/clickable";
import IconButton from "@/components/ui/icon-button";
import dynamic from "next/dynamic";
import { useDebugStore } from "@/state/zustand/debug-store";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { PiCaretDownBold, PiCaretUpBold, PiInfoFill, PiMagnifyingGlass, PiX } from "react-icons/pi";
// (no next/navigation hooks needed here)
import { GlobalContext } from "@/state/providers/global-provider";
import ClickableIcon from "../ui/clickable/clickable-icon";
import { useSessionStore } from "@/state/zustand/session-store";
import { useNotificationStore } from "@/state/zustand/notification-store";
import Link from "next/link";
import { useOverlaySelectorOn } from "@/lib/param-hooks";

const MapDebugSettings = dynamic(() => import("./map-debug-settings"), { ssr: false });

export default function MapSettings() {
  const {
    baseMap,
    overlayMaps,
    markerMode,
    showSmallMarkersEnabled,
    showOverlappingTextEnabled,
    overlayReorderButtonsEnabled,
    setBaseMap,
    addOverlayMap,
    removeOverlayMap,
    moveOverlayMap,
    clearOverlayMaps,
    setMarkerMode,
    setShowSmallMarkersEnabled,
    setShowOverlappingTextEnabled,
    setOverlayReorderButtonsEnabled
  } = useMapSettings();
  const setSnappedPosition = useSessionStore((s) => s.setSnappedPosition);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const removeNotification = useNotificationStore((s) => s.removeNotification);
  const debug = useDebugStore((s) => s.debug);
  const [overlaySearch, setOverlaySearch] = useState('');
  const [expandedOverlayKey, setExpandedOverlayKey] = useState<string | null>(null);
  const overlaySelectorOn = useOverlaySelectorOn();
  const { mapFunctionRef } = useContext(GlobalContext);

  // Add state for h3 resolution

  const markerModes = [
    { key: 'auto', label: 'Automatisk' },
    { key: 'counts', label: 'Klynger' },
    { key: 'labels', label: 'Etikettar' },
    { key: 'points', label: 'Punkt' },
  ];
  const orderedBaseLayerMaps = useMemo(() => {
    const defaultKey = defaultBaseMap || baseLayerMaps[0]?.key;
    if (!defaultKey) return baseLayerMaps;
    return [...baseLayerMaps].sort((a, b) => {
      if (a.key === defaultKey) return -1;
      if (b.key === defaultKey) return 1;
      return 0;
    });
  }, []);
  const selectedOverlays = overlayMaps || [];
  const availableOverlays = useMemo(() => {
    const selected = new Set(selectedOverlays);
    return overlayLayerMaps.filter((item) => !selected.has(item.key));
  }, [selectedOverlays]);
  const filteredOverlays = useMemo(() => {
    const query = overlaySearch.trim().toLowerCase();
    if (!query) return availableOverlays;
    return availableOverlays.filter((item) => item.name.toLowerCase().includes(query));
  }, [overlaySearch, availableOverlays]);
  const overlayMetaByKey = useMemo(() => {
    return overlayLayerMaps.reduce<Record<string, { name: string; provider?: string; description?: string; info?: string }>>(
      (acc, item) => {
        acc[item.key] = {
          name: item.name,
          provider: item.provider,
          description: item.description,
          info: item.info
        };
        return acc;
      },
      {}
    );
  }, []);
  const getAttributionText = (attribution?: string) => {
    if (!attribution) return "";
    return attribution
      .replace(/<[^>]*>/g, " ")
      .replace(/&copy;/gi, "©")
      .replace(/&nbsp;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  useEffect(() => {
    if (selectedOverlays.length > 2) {
      addNotification({
        id: "overlay-performance-warning",
        message: "Fleire kartlag kan redusere ytinga",
        permanentDismiss: true,
        variant: "warning"
      });
    } else {
      removeNotification("overlay-performance-warning");
    }

    return () => removeNotification("overlay-performance-warning");
  }, [addNotification, removeNotification, selectedOverlays.length]);

  const setOverlayPreviewKey = useSessionStore((s) => s.setOverlayPreviewKey);


  const prevOverlaySelectorOnRef = useRef<boolean>(overlaySelectorOn);
  useEffect(() => {
    const prev = prevOverlaySelectorOnRef.current;
    prevOverlaySelectorOnRef.current = overlaySelectorOn;

    if (prev && !overlaySelectorOn) {
      setOverlayPreviewKey(null);
      setExpandedOverlayKey(null);
    }
  }, [overlaySelectorOn, setOverlayPreviewKey]);

  if (overlaySelectorOn) {
    return (
        <section className="flex flex-col gap-8 pb-4 xl:px-2 pt-2">
          <fieldset className="border-0 p-0 m-0">
            <legend className="sr-only">Kartlag</legend>
            <div className="px-2 py-1 flex flex-col gap-3">
              <div className="w-full h-10 relative">
                <input
                  aria-label="Søk i overlegg"
                  value={overlaySearch}
                  onChange={(e) => setOverlaySearch(e.target.value)}
                  className="pl-8 w-full border rounded-md border-neutral-300 h-full px-2"
                />
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <PiMagnifyingGlass aria-hidden={true} className="text-neutral-700 text-xl" />
                </span>
              </div>

              <fieldset>
                <legend className="sr-only">Legg til overlegg</legend>
                <ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-md overflow-hidden">
                  {filteredOverlays.map((item) => {
                    const isExpanded = expandedOverlayKey === item.key;
                    const panelId = `overlay-panel-${item.key}`;
                    return (
                      <li
                        key={item.key}
                        className="w-full bg-white relative"
                      >
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left flex items-center justify-between gap-2"
                          aria-expanded={isExpanded}
                          aria-controls={panelId}
                          onClick={() => {
                            if (isExpanded) {
                              setExpandedOverlayKey(null);
                              setOverlayPreviewKey(null);
                            } else {
                              setExpandedOverlayKey(item.key);
                              setOverlayPreviewKey(item.key);
                            }
                          }}
                        >
                          <span id={`overlay-label-${item.key}`} className="min-w-0 flex-1">
                            <span className="block truncate text-neutral-900">{item.name}</span>
                            {item.provider && (
                              <span className="block text-xs text-neutral-700 truncate">
                                {item.provider}
                              </span>
                            )}
                          </span>
                          <span className="shrink-0 text-neutral-800">
                            {isExpanded ? (
                              <PiCaretUpBold className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <PiCaretDownBold className="w-4 h-4" aria-hidden="true" />
                            )}
                          </span>
                        </button>

                        {isExpanded && (
                          <div id={panelId} className="px-3 pb-3 text-base text-neutral-900">
                            {item.description ? (
                              <div className="text-neutral-900">{item.description}</div>
                            ) : null}
                            {item.info ? (
                              <div className={item.description ? "mt-2" : ""}>
                                <Link
                                  href={item.info}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {getAttributionText(item.props.attribution)}
                                </Link>
                              </div>
                            ) : (
                              <div className="text-neutral-900">
                                {getAttributionText(item.props.attribution)}
                              </div>
                            )}

                            <div className="mt-3 flex items-center justify-end gap-2">
                              <Clickable
                                aria-label={`Legg til overlegg ${item.name}`}
                                remove={['overlaySelector']}
                                className="btn btn-secondary btn-sm whitespace-nowrap inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500"
                                onClick={() => {
                                  addOverlayMap(item.key);
                                  setOverlaySearch('');
                                  setExpandedOverlayKey(null);
                                  setOverlayPreviewKey(null);

                                  const map = mapFunctionRef?.current;
                                  const bounds = item.bounds;
                                  // set drawer position to middle
                                  setSnappedPosition('middle');

                                  if (map && bounds) {
                                    try {
                                      const center = map.getCenter?.();
                                      const [[north, west], [south, east]] = bounds;

                                      let isInside = false;
                                      if (center && typeof center.lat === 'number' && typeof center.lng === 'number') {
                                        const { lat, lng } = center;
                                        isInside =
                                          lat <= north &&
                                          lat >= south &&
                                          lng >= west &&
                                          lng <= east;
                                      }

                                      if (!isInside) {
                                        map.fitBounds(
                                          [
                                            [north, west],
                                            [south, east]
                                          ],
                                          { maxZoom: 8, duration: 0.25 }
                                        );
                                      }
                                    } catch (error) {
                                      console.warn('Failed to adjust map to overlay bounds', error);
                                    }
                                  }
                                }}
                              >
                                <span className="text-sm">Legg til</span>
                              </Clickable>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {!filteredOverlays.length && (
                    <li className="px-3 py-2 text-neutral-700">Ingen fleire overlegg funne</li>
                  )}
                </ul>
              </fieldset>
            </div>
          </fieldset>
        </section>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 xl:px-2">
      {/* Marker Mode Section */}
      <section>
        <fieldset className="border-0 p-0 m-0">
          <div className="mx-3 mb-1 rounded-md border border-neutral-200 p-2">
            <div className="px-1 pb-2 text-lg text-neutral-800">Markørar</div>
            <div className="flex flex-wrap items-center gap-2">
              {markerModes.map((mode) => {
                const selected = markerMode === mode.key;
                return (
                  <ToggleButton
                    key={mode.key}
                    isSelected={selected}
                    onClick={() => setMarkerMode(mode.key)}
                    role="radio"
                    ariaChecked={selected}
                    ariaLabelledBy={`markermode-label-${mode.key}`}
                  >
                    <span
                      id={`markermode-label-${mode.key}`}
                      className="whitespace-nowrap"
                    >
                      {mode.label}
                    </span>
                  </ToggleButton>
                );
              })}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2">
              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSmallMarkersEnabled}
                  onChange={(e) => setShowSmallMarkersEnabled(e.target.checked)}
                  aria-label="Vis små punktmarkørar"
                  className="h-4 w-4 accent-accent-800"
                />
                <span className="leading-none">Vis små punktmarkørar</span>
              </label>

              <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showOverlappingTextEnabled}
                  onChange={(e) => setShowOverlappingTextEnabled(e.target.checked)}
                  aria-label="Vis overlappande tekst"
                  className="h-4 w-4 accent-accent-800"
                />
                <span className="leading-none">Vis overlappande tekst</span>
              </label>
            </div>
          </div>
        </fieldset>
      </section>

      {/* Basemap Section */}
      <section>
        <fieldset className="border-0 p-0 m-0">
          <div className="mx-3 mb-1 rounded-md border border-neutral-200 p-2">
            <div className="px-1 pb-2 text-lg text-neutral-800">Bakgrunnslag</div>
            <div className="flex flex-wrap items-center gap-2">
              {orderedBaseLayerMaps.map((item) => {
                const selected = baseMap === item.key;
                return (
                  <ToggleButton
                    key={item.key}
                    isSelected={selected}
                    onClick={() => setBaseMap(item.key)}
                    role="radio"
                    ariaChecked={selected}
                    ariaLabelledBy={`basemap-label-${item.key}`}
                  >
                    <span
                      id={`basemap-label-${item.key}`}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </span>
                  </ToggleButton>
                );
              })}
            </div>
          </div>
        </fieldset>
      </section>

      <section>
        <fieldset className="border-0 p-0 m-0">
          {selectedOverlays.length > 0 && (
            <legend className="text-lg text-neutral-800 px-4 pt-3 pb-1">
              Andre kartlag
            </legend>
          )}

          <div className="px-4 pb-3 flex flex-col gap-3">
            {selectedOverlays.length > 0 && (
              <fieldset>
                <legend className="sr-only">Aktive kartlag</legend>
                <ul className="flex flex-col divide-y divide-neutral-200 border border-neutral-200 rounded-md">
                  {selectedOverlays.map((overlayKey, index) => {
                    const meta = overlayMetaByKey[overlayKey];
                    const title = meta?.name || overlayKey;
                    return (
                      <li key={overlayKey} className="p-2 flex items-start gap-3">
                        {overlayReorderButtonsEnabled ? (
                          <div className="flex flex-col gap-1">
                            <IconButton
                              label="Flytt kartlag opp"
                              className="text-sm aspect-square btn btn-outline btn-sm p-1 h-6 w-6 min-h-0"
                              onClick={() => moveOverlayMap(index, index - 1)}
                              disabled={index === 0}
                            >
                              <PiCaretUpBold />
                            </IconButton>
                            <IconButton
                              label="Flytt kartlag ned"
                              className="text-sm aspect-square btn btn-outline btn-sm p-1 h-6 w-6 min-h-0"
                              onClick={() => moveOverlayMap(index, index + 1)}
                              disabled={index === selectedOverlays.length - 1}
                            >
                              <PiCaretDownBold />
                            </IconButton>
                          </div>
                        ) : null}
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1">
                            <span className="block truncate">{title}</span>
                            {meta?.info && (
                              <Link
                                href={meta.info}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Opne informasjon om ${title}`}
                                className="shrink-0 text-neutral-700 hover:text-neutral-900"
                              >
                                <PiInfoFill className="inline text-base" aria-hidden="true" />
                              </Link>
                            )}
                          </span>
                          {meta?.provider && (
                            <span className="block text-xs text-neutral-700 truncate">
                              {meta.provider}
                            </span>
                          )}
                        </span>
                        <div className="ml-auto">
                          <IconButton
                            label="Fjern kartlag"
                            className="text-lg aspect-square btn btn-outline btn-sm p-2"
                            onClick={() => removeOverlayMap(overlayKey)}
                          >
                            <PiX />
                          </IconButton>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}

            <div className="flex flex-wrap gap-3 items-center justify-end">
              {selectedOverlays.length > 1 && (
                <label className="inline-flex items-center gap-2 text-sm text-neutral-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={overlayReorderButtonsEnabled}
                    onChange={(e) => setOverlayReorderButtonsEnabled(e.target.checked)}
                    aria-label="Endre rekkjefølge"
                    className="h-4 w-4 accent-accent-800"
                  />
                  <span className="leading-none whitespace-nowrap">Endre rekkjefølge</span>
                </label>
              )}
              {selectedOverlays.length > 0 && (
                <Clickable onClick={() => clearOverlayMaps()} className="btn btn-outline btn-sm whitespace-nowrap inline-flex items-center">
                  Fjern alle
                </Clickable>
              )}
              <Clickable
                link
                add={{ overlaySelector: "on" }}
                className="btn btn-neutral btn-sm whitespace-nowrap inline-flex items-center"
              >
                Legg til fleire kartlag
              </Clickable>
            </div>
          </div>
        </fieldset>
      </section>

      {debug && <MapDebugSettings />}
    </div>
  );
}
