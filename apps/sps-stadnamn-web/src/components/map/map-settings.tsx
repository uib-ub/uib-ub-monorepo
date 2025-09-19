import { baseMaps } from "@/config/basemap-config";
import { useMapSettings } from "@/state/zustand/persistent-map-settings";
import { PiCheckCircleFill } from "react-icons/pi";
import Clickable from "../ui/clickable/clickable";
import { usePerspective } from "@/lib/param-hooks";

export default function MapSettings() {
  const { baseMap, markerMode, setBaseMap, setMarkerMode } = useMapSettings();
  const perspective = usePerspective();

  const markerModes = [
    { key: 'auto', label: 'Automatisk' },
    { key: 'counts', label: 'Klynger' },
    { key: 'labels', label: 'Etiketter' },
  ];

  return (
    <div className="flex flex-col divide-y divide-neutral-200">
      {/* Basemap Section */}
      <section>
        <h3 className="text-base font-semibold text-neutral-900 p-3">Bakgrunnskart</h3>
        <div role="radiogroup" aria-label="Velg bakgrunnskart" className="flex flex-col px-2 divide-y divide-neutral-200">
          {baseMaps.map((item) => (
            <div key={item.key} className="py-2">
              <Clickable
                onClick={() => setBaseMap(perspective, item.key)}
                role="radio"
                aria-checked={baseMap[perspective] === item.key}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 ${
                  baseMap[perspective] === item.key ? "bg-neutral-100" : ""
                }`}
              >
                <span className="text-neutral-900">{item.name}</span>
                {baseMap[perspective] === item.key && (
                  <PiCheckCircleFill className="text-primary-600 text-lg" aria-hidden="true" />
                )}
              </Clickable>
            </div>
          ))}
        </div>
      </section>

      {/* Marker Mode Section */}
      <section>
        <h3 className="text-base font-semibold text-neutral-900 p-3">Markørar</h3>
        <div role="radiogroup" aria-label="Velg markørtype" className="flex flex-col px-2 divide-y divide-neutral-200">
          {markerModes.map((mode) => (
            <div key={mode.key} className="py-2">
              <Clickable
                onClick={() => setMarkerMode(mode.key)}
                role="radio"
                aria-checked={markerMode === mode.key}
                className={`flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 ${
                  markerMode === mode.key ? "bg-neutral-100" : ""
                }`}
              >
                <span className="text-neutral-900">{mode.label}</span>
                {markerMode === mode.key && (
                  <PiCheckCircleFill className="text-primary-600 text-lg" aria-hidden="true" />
                )}
              </Clickable>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
